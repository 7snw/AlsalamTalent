const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    freelancerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
    freelancerName: { type: String, required: true },
    freelancerEmail:{ type: String, required: true },
    spaceType:      { type: String, enum: ['desk', 'studio', 'podcast'], required: true },
    dateISO:        { type: String, required: true },    
    timeRange:      { type: String, required: true },  
    notes:          { type: String }
  },
  { timestamps: true }
);


BookingSchema.index({ spaceType: 1, dateISO: 1, timeRange: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);
