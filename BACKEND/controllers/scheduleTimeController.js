const Schedule = require("../models/scheduleTime");

// Helper function for error handling
const handleErrorResponse = (res, error, message) => {
    console.error(error);
    res.status(500).json({ status: message, error: error.message });
};

// Helper function to sanitize strings to prevent XSS
const sanitize = (str) => {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
};

// Add a new schedule
const addSchedule = async (req, res) => {
    try {
        const { address, district, dateTime } = req.body;

        // Input validation
        if (!address || !district || !dateTime) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Sanitize inputs
        const newSchedule = new Schedule({
            address: sanitize(address),
            district: sanitize(district),
            dateTime
        });

        const savedSchedule = await newSchedule.save();
        res.json({ message: "Schedule Details Added.", scheduleId: savedSchedule._id });
    } catch (err) {
        handleErrorResponse(res, err, "Failed to add schedule details.");
    }
};

// Get all schedule details
const getAllSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find();
        res.json(schedules);
    } catch (err) {
        handleErrorResponse(res, err, "Failed to fetch schedules.");
    }
};

// Update schedule details
const updateSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.scheduleId;
        const { address, district, dateTime } = req.body;

        // Input validation
        if (!address || !district || !dateTime) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Sanitize inputs
        const updateScheduleDetails = {
            address: sanitize(address),
            district: sanitize(district),
            dateTime
        };

        const updated = await Schedule.findByIdAndUpdate(scheduleId, updateScheduleDetails, { new: true });
        if (!updated) {
            return res.status(404).json({ error: "Schedule not found." });
        }

        res.status(200).json({ status: "Schedule Details updated successfully", schedule: updated });
    } catch (err) {
        handleErrorResponse(res, err, "Error updating schedule details.");
    }
};

// Delete schedule
const deleteSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.scheduleId;
        const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);

        if (!deletedSchedule) {
            return res.status(404).json({ status: "Schedule details not found." });
        }

        res.status(200).json({ status: "Schedule details deleted successfully." });
    } catch (err) {
        handleErrorResponse(res, err, "Error deleting schedule details.");
    }
};

// Confirm schedule
const confirmSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.body;

        if (!scheduleId) {
            return res.status(400).json({ status: "Schedule ID is required." });
        }

        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ status: "Schedule details not found." });
        }

        res.status(200).json({ status: "Schedule confirmed.", schedule });
    } catch (err) {
        handleErrorResponse(res, err, "Error confirming schedule.");
    }
};

module.exports = {
    addSchedule,
    getAllSchedules,
    updateSchedule,
    deleteSchedule,
    confirmSchedule
};
