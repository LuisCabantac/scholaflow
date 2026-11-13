import { beforeEach, describe, expect, it, vi } from "vitest";

import { renameTopicFlow } from "@/services/class-topic-flows";

const topics = vi.hoisted(() => ({
  getClassTopicByTopicId: vi.fn(),
  updateClassTopicRecord: vi.fn(),
  createClassTopicRecord: vi.fn(),
  deleteClassTopicRecord: vi.fn(),
}));
const classrooms = vi.hoisted(() => ({
  getClassByClassId: vi.fn(),
  isClassMember: vi.fn(),
}));
const streams = vi.hoisted(() => ({
  getAllClassworkStreamsByTopicId: vi.fn(),
  updateClassStreamPostTopic: vi.fn(),
}));

vi.mock("@/services/class-topic", () => topics);
vi.mock("@/services/classroom", () => classrooms);
vi.mock("@/services/stream", () => streams);

const teacher = { id: "t1", name: "T", image: null, role: "user" };
const topic = {
  id: "tp1",
  classId: "c1",
  name: "Week 1",
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  topics.getClassTopicByTopicId.mockResolvedValue(topic);
  topics.updateClassTopicRecord.mockResolvedValue({ ...topic, name: "Week 2" });
  classrooms.getClassByClassId.mockResolvedValue({ id: "c1", teacherId: "t1" });
  streams.getAllClassworkStreamsByTopicId.mockResolvedValue([{ id: "s1" }]);
});

describe("renameTopicFlow", () => {
  it("rejects a topic that belongs to another class than the form's", async () => {
    const outcome = await renameTopicFlow(teacher, "tp1", "Week 2", "c2");
    expect(outcome).toMatchObject({ ok: false, code: "not_found" });
    expect(topics.updateClassTopicRecord).not.toHaveBeenCalled();
  });

  it("rejects a caller who does not teach the topic's class", async () => {
    const outcome = await renameTopicFlow({ ...teacher, id: "u2" }, "tp1", "x");
    expect(outcome).toMatchObject({ ok: false, code: "forbidden" });
  });

  it("reports no change when the name is the same", async () => {
    const outcome = await renameTopicFlow(teacher, "tp1", "Week 1", "c1");
    expect(outcome).toEqual({ ok: true, value: { changed: false } });
    expect(streams.updateClassStreamPostTopic).not.toHaveBeenCalled();
  });

  it("relabels the posts before updating the topic", async () => {
    const outcome = await renameTopicFlow(teacher, "tp1", "Week 2", "c1");
    expect(outcome).toEqual({ ok: true, value: { changed: true } });
    expect(streams.updateClassStreamPostTopic).toHaveBeenCalledWith(
      "edit",
      { id: "s1" },
      "Week 2",
    );
    expect(topics.updateClassTopicRecord).toHaveBeenCalledWith("tp1", {
      name: "Week 2",
    });
  });
});
