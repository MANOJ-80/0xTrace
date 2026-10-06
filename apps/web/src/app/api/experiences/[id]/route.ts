import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "0xtrace-admin";

function isAuthenticated(req: NextRequest) {
  const authHeader = req.headers.get("x-admin-key");
  return authHeader === ADMIN_PASSWORD;
}

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
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const col = await getCollection("experiences");

    // Remove _id from body before update to avoid immutable field error
    const { _id, ...updateData } = body;

    let query: any = {};
    if (ObjectId.isValid(params.id)) {
      query = { _id: new ObjectId(params.id) };
    } else {
      query = { id: params.id };
    }

    const result = await col.updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update", detail: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
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

    const result = await col.deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Update metadata count
    const metaCol = await getCollection("metadata");
    const totalCount = await col.countDocuments();
    await metaCol.updateOne(
      { _id: "dataset_metadata" } as any,
      { $set: { total_experiences: totalCount, updated_at: new Date().toISOString() } }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete", detail: err.message }, { status: 500 });
  }
}
