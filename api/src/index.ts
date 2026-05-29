import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "success", message: "API is running!" });
});

// ==========================================
// مسار تسجيل الدخول (Login API)
// ==========================================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email } });

    if (!user) return res.status(404).json({ error: "البريد الإلكتروني غير مسجل لدينا" });
    if (user.password !== password) return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    if (!user.isActive) return res.status(403).json({ error: "هذا الحساب موقوف، يرجى مراجعة الإدارة" });

    let profileName = 'مدير النظام';
    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
      if (teacher) profileName = teacher.nameAr;
    } else if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (student) profileName = student.nameAr;
    }

    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      user: { id: user.id, email: user.email, role: user.role, name: profileName }
    });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ في الخادم أثناء تسجيل الدخول" });
  }
});

// ==========================================
// مسارات الطلاب
// ==========================================
app.get("/students", async (req, res) => {
  try {
    const students = await prisma.student.findMany({ include: { user: true } });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.post("/students", async (req, res) => {
  try {
    const { nameAr, nameEn, email, nationality, status } = req.body;
    const newStudent = await prisma.student.create({
      data: {
        nameAr, nameEn, status: status || 'LEAD', nationality,
        user: { create: { email: email || `user-${Date.now()}@academy.com`, role: 'STUDENT', isActive: true } }
      }, include: { user: true }
    });
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: "Failed to create student" });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nameAr, nameEn, email, nationality, status } = req.body;
    const updatedStudent = await prisma.student.update({
      where: { id: id },
      data: { nameAr, nameEn, nationality, status, user: { update: { email: email } } },
      include: { user: true }
    });
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: "Failed to update student" });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.student.delete({ where: { id: id } });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// ==========================================
// مسارات المعلمين
// ==========================================
app.get("/teachers", async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({ include: { user: true } });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

app.post("/teachers", async (req, res) => {
  try {
    const { nameAr, nameEn, email, specialization, paymentMethod, hourlyRate, percentageRate, status } = req.body;
    const newTeacher = await prisma.teacher.create({
      data: {
        nameAr, nameEn, specialization, status: status || 'ACTIVE', paymentMethod: paymentMethod || 'HOURLY',
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null, percentageRate: percentageRate ? parseFloat(percentageRate) : null,
        user: { create: { email: email || `teacher-${Date.now()}@academy.com`, role: 'TEACHER', isActive: true } }
      }, include: { user: true }
    });
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(500).json({ error: "Failed to create teacher" });
  }
});

app.put("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nameAr, nameEn, email, specialization, paymentMethod, hourlyRate, percentageRate, status } = req.body;
    const updatedTeacher = await prisma.teacher.update({
      where: { id: id },
      data: {
        nameAr, nameEn, specialization, status, paymentMethod,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null, percentageRate: percentageRate ? parseFloat(percentageRate) : null,
        user: { update: { email: email } }
      }, include: { user: true }
    });
    res.status(200).json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ error: "Failed to update teacher" });
  }
});

app.delete("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id: id } });
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

// ==========================================
// مسارات الدورات (Courses) 
// ==========================================
app.get("/courses", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

app.post("/courses", async (req, res) => {
  try {
    const { nameAr, nameEn, type, level, price, isActive } = req.body;
    const newCourse = await prisma.course.create({
      data: {
        nameAr, nameEn, type,
        level: parseInt(level) || 1,
        price: price ? parseFloat(price) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: "Failed to create course" });
  }
});

app.put("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nameAr, nameEn, type, level, price, isActive } = req.body;
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        nameAr, nameEn, type,
        level: parseInt(level) || 1,
        price: price ? parseFloat(price) : null,
        isActive
      }
    });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: "Failed to update course" });
  }
});

app.delete("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

// ==========================================
// مسارات الاشتراكات (Enrollments)
// ==========================================
app.get("/enrollments", async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: { student: true, course: true, teacher: true },
      orderBy: { enrolledAt: 'desc' }
    });
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

app.post("/enrollments", async (req, res) => {
  try {
    const { studentId, courseId, teacherId } = req.body;
    const existingEnrollment = await prisma.enrollment.findFirst({ where: { studentId, courseId } });

    if (existingEnrollment) return res.status(400).json({ error: "الطالب مسجل بالفعل في هذه الدورة" });

    const newEnrollment = await prisma.enrollment.create({
      data: { studentId, courseId, teacherId: teacherId || null },
      include: { student: true, course: true, teacher: true }
    });
    res.status(201).json(newEnrollment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create enrollment" });
  }
});

app.delete("/enrollments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.enrollment.delete({ where: { id } });
    res.status(200).json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete enrollment" });
  }
});

// ==========================================
// مسارات سجل القرآن (Quran Records)
// ==========================================
app.get("/quran-records", async (req, res) => {
  try {
    const records = await prisma.quranRecord.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all quran records" });
  }
});

app.get("/quran-records/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await prisma.quranRecord.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quran records" });
  }
});

app.post("/quran-records", async (req, res) => {
  try {
    const { studentId, teacherId, trackType, surahStart, ayahStart, surahEnd, ayahEnd, pagesCount, recitationScore, tajweedErrors, teacherNotes } = req.body;
    
    const newRecord = await prisma.quranRecord.create({
      data: {
        studentId, teacherId, trackType, surahStart,
        ayahStart: ayahStart ? parseInt(ayahStart) : null,
        surahEnd,
        ayahEnd: ayahEnd ? parseInt(ayahEnd) : null,
        pagesCount: parseFloat(pagesCount) || 0,
        recitationScore: recitationScore ? parseFloat(recitationScore) : null,
        tajweedErrors: tajweedErrors || [],
        teacherNotes
      }
    });

    await prisma.enrollment.updateMany({
      where: { studentId, teacherId },
      data: { progress: { increment: parseFloat(pagesCount) * 0.16 } }
    });

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: "Failed to create quran record" });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(8080, () => console.log("Server running on port 8080"));
}

export default app;