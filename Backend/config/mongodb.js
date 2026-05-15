import mongoose from "mongoose";

const ensureAppointmentIndexes = async () => {
  const collection = mongoose.connection.collection("appointments");

  await collection.updateMany(
    { patientBookingId: "" },
    { $unset: { patientBookingId: "" } }
  );
  await collection.updateMany(
    { appointmentPublicId: "" },
    { $unset: { appointmentPublicId: "" } }
  );

  const indexes = await collection.indexes();
  const patientBookingIndex = indexes.find((idx) => idx.name === "patientBookingId_1");
  const appointmentPublicIndex = indexes.find((idx) => idx.name === "appointmentPublicId_1");

  if (patientBookingIndex?.unique) {
    await collection.dropIndex("patientBookingId_1");
    await collection.createIndex({ patientBookingId: 1 }, { name: "patientBookingId_1" });
    console.log("Updated appointments index: patientBookingId_1 (non-unique)");
  }

  if (
    appointmentPublicIndex &&
    (!appointmentPublicIndex.unique || !appointmentPublicIndex.sparse)
  ) {
    await collection.dropIndex("appointmentPublicId_1");
    await collection.createIndex(
      { appointmentPublicId: 1 },
      { name: "appointmentPublicId_1", unique: true, sparse: true }
    );
    console.log("Updated appointments index: appointmentPublicId_1 (unique+sparse)");
  }
};

const ensureUserIndexes = async () => {
  const collection = mongoose.connection.collection("users");

  await collection.updateMany({ patientId: "" }, { $unset: { patientId: "" } });
  await collection.updateMany({ doctorId: "" }, { $unset: { doctorId: "" } });

  const indexes = await collection.indexes();
  const patientIndex = indexes.find((idx) => idx.name === "patientId_1");
  const doctorIndex = indexes.find((idx) => idx.name === "doctorId_1");

  if (patientIndex && (!patientIndex.unique || !patientIndex.sparse)) {
    await collection.dropIndex("patientId_1");
    await collection.createIndex(
      { patientId: 1 },
      { name: "patientId_1", unique: true, sparse: true }
    );
  }

  if (doctorIndex && (!doctorIndex.unique || !doctorIndex.sparse)) {
    await collection.dropIndex("doctorId_1");
    await collection.createIndex(
      { doctorId: 1 },
      { name: "doctorId_1", unique: true, sparse: true }
    );
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await ensureAppointmentIndexes();
    await ensureUserIndexes();
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;
