// Event Schema, to check if there is a required event at a run of the algorithm 

const mongoose = require("mongoose");

const eventSchema = new Schema({
    name: String,
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    startTime: Date,
    endTime: Date,
    matchingRun: Boolean
  });

module.exports = mongoose.model('Event', eventSchema);
