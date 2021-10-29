const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const interestSchema = new mongoose.Schema(
    {
        interest: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 90,
            lowercase: true,
        },
        user: {
            type: ObjectId,
            required: true,
            ref: "User"
        }
    },
    {
        timestamps: true,
    }
);

const Insterest = mongoose.model("Interest", interestSchema);

module.exports = Insterest;
