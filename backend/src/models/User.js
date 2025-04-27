const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    fullname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    avatarURL: { type: String },
    action: {
      type: String,
      enum: ["lock", "unlock"],
      default: "unlock",
    },
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  // if (!this.isModified("password")) {
  //   return next();
  // }
  // const salt = await bcrypt.genSalt(10);
  // this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// Method to login old account
userSchema.methods.comparePassword = async function (candidatePassword) {
  return this.password === candidatePassword;
};

module.exports = mongoose.model("User", userSchema);
