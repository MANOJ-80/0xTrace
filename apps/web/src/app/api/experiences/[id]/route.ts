import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const col = await getCollection("experiences");
    let doc = null;

    if (ObjectId.isValid(params.id)) {
      doc = await col.findOne({ _id: new ObjectId(params.id) });
    } else {
      doc = await col.findOne({ id: params.id });
    }

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ...doc, _id: doc._id.toString() });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch", detail: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const col = await getCollection("experiences");

    let query: any = {};
    if (ObjectId.isValid(params.id)) {
      query = { _id: new ObjectId(params.id) };
    } else {
      query = { id: params.id };
    }

    const existingDoc = await col.findOne(query);
    if (!existingDoc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userEmail = session.user.email.toLowerCase();
    const isAuthor =
      existingDoc.author?.email &&
      existingDoc.author.email.toLowerCase() === userEmail;
    const isAdmin = !!session.user.isAdmin;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to edit this experience" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Prevent overwriting immutable or security fields
    const { _id, id, author, created_at, ...updateData } = body;

    const finalUpdate: any = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Only admins can deliberately alter the author field
    if (isAdmin && author !== undefined) {
      finalUpdate.author = author;
    }

    const result = await col.updateOne(query, { $set: finalUpdate });

    revalidatePath("/experiences");
    revalidatePath(`/experiences/${params.id}`);
    revalidatePath("/my-experiences");
    revalidatePath("/questions");
    revalidatePath("/analytics");
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update", detail: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const col = await getCollection("experiences");
    
    let query: any = {};
    if (ObjectId.isValid(params.id)) {
      query = { _id: new ObjectId(params.id) };
    } else {
      query = { id: params.id };
    }

    const existingDoc = await col.findOne(query);
    if (!existingDoc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userEmail = session.user.email.toLowerCase();
    const isAuthor =
      existingDoc.author?.email &&
      existingDoc.author.email.toLowerCase() === userEmail;
    const isAdmin = !!session.user.isAdmin;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete this experience" },
        { status: 403 }
      );
    }

    const result = await col.deleteOne(query);

    // Update metadata count
    const metaCol = await getCollection("metadata");
    const totalCount = await col.countDocuments();
    await metaCol.updateOne(
      { _id: "dataset_metadata" } as any,
      { $set: { total_experiences: totalCount, updated_at: new Date().toISOString() } }
    );

    revalidatePath("/experiences");
    revalidatePath(`/experiences/${params.id}`);
    revalidatePath("/my-experiences");
    revalidatePath("/questions");
    revalidatePath("/analytics");
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete", detail: err.message }, { status: 500 });
  }
}
