module.exports = mongoose => {
  const schema = mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, "Title is required."],
        trim: true,
        minlength: [1, "Title cannot be empty."],
        maxlength: [100, "Title is too long (max 100 characters)."]
      },
      description: {
        type: String,
        trim: true,
        maxlength: [500, "Description is too long (max 500 characters)."]
      },
      published: {
        type: Boolean,
        default: false
      }
    },
    { timestamps: true }
  );

  // Indexes to support common query patterns (filtering and sorting).
  schema.index({ title: 1 });
  schema.index({ published: 1, createdAt: -1 });

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Tutorial = mongoose.model("tutorial", schema);
  return Tutorial;
};
