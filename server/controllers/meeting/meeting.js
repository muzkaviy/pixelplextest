const MeetingHistory = require("../../model/schema/meeting");
const mongoose = require("mongoose");

const add = async (req, res) => {
  try {
    req.body.createdDate = new Date();
    const meeting = new MeetingHistory(req.body);
    await meeting.save();
    res.status(200).json();
  } catch (err) {
    console.error("Failed to create MeetingHistory:", err);
    res.status(400).json({ error: "Failed to create MeetingHistory" });
  }
};

const index = async (req, res) => {
  const query = req.query;
  query.deleted = false;

  let allData = await MeetingHistory.find(query)
    .populate({
      path: "createBy",
      match: { deleted: false }, // Populate only if createBy.deleted is false
    })
    .exec();

  const result = allData.filter((item) => item.createBy !== null);
  res.send(result);
};

const view = async (req, res) => {
  let meetingHistory = await MeetingHistory.findOne({ _id: req.params.id });
  if (!meetingHistory)
    return res.status(404).json({ message: "no Data Found." });

  let query = req.query;
  if (query.sender) {
    query.sender = new mongoose.Types.ObjectId(query.sender);
  }
  query.createByLead = req.params.id;

  res.status(200).json({ meetingHistory });
};

const deleteData = async (req, res) => {
  try {
    const meeting = await MeetingHistory.findByIdAndUpdate(req.params.id, {
      deleted: true,
    });
    res.status(200).json({ message: "done", meeting });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const deleteMany = async (req, res) => {
  try {
    const meeting = await MeetingHistory.updateMany(
      { _id: { $in: req.body } },
      { $set: { deleted: true } }
    );
    res.status(200).json({ message: "done", meeting });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

module.exports = { add, index, view, deleteData, deleteMany };
