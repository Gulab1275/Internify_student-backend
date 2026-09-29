const Student = require('../models/student');

exports.createStudent = async (req, res) => {
  try {
    const studentData = { ...req.body, createdBy: req.user.id };
    if (req.file) studentData.profileImage = req.file.path;

    const student = await Student.create(studentData);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const students = await Student.find(query).skip(skip).limit(limit);
    const total = await Student.countDocuments(query);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      students
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // RBAC check: Only admin or owner can update
    if (req.user.role !== 'admin' && student.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own data' });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (req.user.role !== 'admin' && student.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own data' });
    }

    await student.deleteOne();
    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};