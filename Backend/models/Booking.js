// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    freelancerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
    freelancerName: { type: String, required: true },
    freelancerEmail:{ type: String, required: true },
    spaceType:      { type: String, enum: ['desk', 'studio', 'podcast'], required: true },
    dateISO:        { type: String, required: true },      // "YYYY-MM-DD"
    timeRange:      { type: String, required: true },      // "3:00pm–6:00pm"
    notes:          { type: String }
  },
  { timestamps: true }
);

// prevent double-booking the same slot
BookingSchema.index({ spaceType: 1, dateISO: 1, timeRange: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);
