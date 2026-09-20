from pydantic import BaseModel, ConfigDict, Field


class Question(BaseModel):
    model_config = ConfigDict(extra="forbid")
    text: str
    kind: str = "technical"


class Coding(BaseModel):
    model_config = ConfigDict(extra="forbid")
    present: bool = False
    language: str | None = None
    problems: list[str] = Field(default_factory=list)


class InterviewRound(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sequence: int
    name: str
    type: str = "unknown"
    date: str | None = None
    time: str | None = None
    mode: str | None = None
    platform: str | None = None
    duration: str | None = None
    difficulty: str | None = None
    sections: list[str] = Field(default_factory=list)
    topics: list[str] = Field(default_factory=list)
    questions: list[Question] = Field(default_factory=list)
    coding: Coding = Field(default_factory=Coding)
    description: str = ""


class ExperienceDraft(BaseModel):
    """A reviewable draft; do not treat it as canonical data until approved."""
    model_config = ConfigDict(extra="forbid")
    candidate_name: str | None = None
    department: str | None = None
    company_name: str | None = None
    role: str | None = None
    employment_type: str = "unknown"
    location: str | None = None
    month_visited: str | None = None
    year_visited: str | None = None
    eligibility: list[str] = Field(default_factory=list)
    compensation: dict[str, str] = Field(default_factory=dict)
    pre_placement: list[str] = Field(default_factory=list)
    rounds: list[InterviewRound] = Field(default_factory=list)
    outcome: str | None = None
    tips: list[str] = Field(default_factory=list)
    contacts: dict[str, str] = Field(default_factory=dict)
    additional_information: list[str] = Field(default_factory=list)
    extraction_notes: list[str] = Field(default_factory=list)


class ParseResponse(BaseModel):
    filename: str
    page_count: int
    text_characters: int
    extraction_method: str
    experience: ExperienceDraft
