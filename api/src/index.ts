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

    return res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      user: { id: user.id, email: user.email, role: user.role, name: profileName }
    });
  } catch (error: any) {
    console.error("LOGIN_ERROR:", error);
    return res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

// المعلمون
app.get("/teachers", async (req, res) => {
  try { res.status(200).json(await prisma.teacher.findMany({ include: { user: true } })); } 
  catch (error: any) { res.status(500).json({ error: "Failed to fetch teachers" }); }
});

app.post("/teachers", async (req, res) => {
  try {
    const { nameAr, nameEn, email, specialization, paymentMethod, hourlyRate, percentageRate, status } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    const newTeacher = await prisma.teacher.create({
      data: { 
        nameAr, nameEn, specialization, status: status || 'ACTIVE', 
        paymentMethod: paymentMethod || 'HOURLY', 
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null, 
        percentageRate: percentageRate ? parseFloat(percentageRate) : null, 
        ...(existingUser 
          ? { user: { connect: { id: existingUser.id } } } 
          : { user: { create: { email: email || `teacher-${Date.now()}@test.com`, role: 'TEACHER', isActive: true } } }
        )
      },
      include: { user: true }
    });
    if (existingUser && existingUser.role !== 'SUPER_ADMIN' && existingUser.role !== 'ADMIN') {
        await prisma.user.update({ where: { id: existingUser.id }, data: { role: 'TEACHER' } });
    }
    res.status(201).json(newTeacher);
  } catch (error: any) { res.status(500).json({ error: "Failed to create teacher" }); }
});

app.put("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params; const { nameAr, nameEn, email, specialization, paymentMethod, hourlyRate, percentageRate, status } = req.body;
    res.status(200).json(await prisma.teacher.update({
      where: { id }, data: { nameAr, nameEn, specialization, status, paymentMethod, hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null, percentageRate: percentageRate ? parseFloat(percentageRate) : null, user: { update: { email } } }, include: { user: true }
    }));
  } catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.delete("/teachers/:id", async (req, res) => {
  try { await prisma.teacher.delete({ where: { id: req.params.id } }); res.status(200).json({ message: "Deleted" }); } 
  catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

// الطلاب
app.get("/students", async (req, res) => {
  try { res.status(200).json(await prisma.student.findMany({ include: { user: true } })); } 
  catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.post("/students", async (req, res) => {
  try {
    const { 
      nameAr, nameEn, email, nationality, status, 
      parentName, parentPhone, targetTrack, targetPackage, 
      memPerSession, daysPerWeek, expectedMonths, monthlyFee, memorizationDirection
    } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });

    const newStudent = await prisma.student.create({
      data: { 
        nameAr, nameEn, status: status || 'LEAD', nationality,
        parentName, parentPhone, targetTrack, targetPackage,
        memPerSession: memPerSession ? parseFloat(memPerSession) : null,
        daysPerWeek: daysPerWeek ? parseInt(daysPerWeek) : null,
        expectedMonths: expectedMonths ? parseInt(expectedMonths) : null,
        monthlyFee: monthlyFee ? parseFloat(monthlyFee) : null,
        memorizationDirection: memorizationDirection || 'FORWARD',
        ...(existingUser 
          ? { user: { connect: { id: existingUser.id } } } 
          : { user: { create: { email: email || `user-${Date.now()}@test.com`, role: 'STUDENT', isActive: true } } }
        )
      },
      include: { user: true }
    });
    res.status(201).json(newStudent);
  } catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params; 
    const { 
      nameAr, nameEn, email, nationality, status,
      parentName, parentPhone, targetTrack, targetPackage, 
      memPerSession, daysPerWeek, expectedMonths, monthlyFee, memorizationDirection
    } = req.body;

    const updatedStudent = await prisma.student.update({
      where: { id }, 
      data: { 
        nameAr, nameEn, nationality, status, 
        parentName, parentPhone, targetTrack, targetPackage,
        memPerSession: memPerSession ? parseFloat(memPerSession) : null,
        daysPerWeek: daysPerWeek ? parseInt(daysPerWeek) : null,
        expectedMonths: expectedMonths ? parseInt(expectedMonths) : null,
        monthlyFee: monthlyFee ? parseFloat(monthlyFee) : null,
        memorizationDirection,
        user: { update: { email } } 
      }, 
      include: { user: true }
    });
    res.status(200).json(updatedStudent);
  } catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.delete("/students/:id", async (req, res) => {
  try { await prisma.student.delete({ where: { id: req.params.id } }); res.status(200).json({ message: "Deleted" }); } 
  catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

// الدورات
app.get("/courses", async (req, res) => {
  try { res.status(200).json(await prisma.course.findMany({ orderBy: { createdAt: 'desc' } })); } 
  catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.post("/courses", async (req, res) => {
  try {
    const { nameAr, nameEn, type, level, price, isActive } = req.body;
    res.status(201).json(await prisma.course.create({ data: { nameAr, nameEn, type, level: parseInt(level) || 1, price: price ? parseFloat(price) : null, isActive: isActive !== undefined ? isActive : true } }));
  } catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.put("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params; const { nameAr, nameEn, type, level, price, isActive } = req.body;
    res.status(200).json(await prisma.course.update({ where: { id }, data: { nameAr, nameEn, type, level: parseInt(level) || 1, price: price ? parseFloat(price) : null, isActive } }));
  } catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.delete("/courses/:id", async (req, res) => {
  try { await prisma.course.delete({ where: { id: req.params.id } }); res.status(200).json({ message: "Deleted" }); } 
  catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

// الاشتراكات
app.get("/enrollments", async (req, res) => {
  try { res.status(200).json(await prisma.enrollment.findMany({ include: { student: true, course: true, teacher: true }, orderBy: { enrolledAt: 'desc' } })); } 
  catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.post("/enrollments", async (req, res) => {
  try {
    const { studentId, courseId, teacherId } = req.body;
    const existing = await prisma.enrollment.findFirst({ where: { studentId, courseId } });
    if (existing) return res.status(400).json({ error: "الطالب مسجل بالفعل" });
    
    const enrollment = await prisma.enrollment.create({ 
        data: { studentId, courseId, teacherId: teacherId || null }, 
        include: { student: true, course: true, teacher: true } 
    });
    return res.status(201).json(enrollment);
  } catch (error: any) { 
    console.error(error); 
    return res.status(500).json({ error: "Failed" }); 
  }
});

app.delete("/enrollments/:id", async (req, res) => {
  try { await prisma.enrollment.delete({ where: { id: req.params.id } }); res.status(200).json({ message: "Deleted" }); } 
  catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

// سجل القرآن
app.get("/quran-records", async (req, res) => {
  try { res.status(200).json(await prisma.quranRecord.findMany({ include: { student: true }, orderBy: { createdAt: 'desc' } })); } 
  catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.get("/quran-records/:studentId", async (req, res) => {
  try { res.status(200).json(await prisma.quranRecord.findMany({ where: { studentId: req.params.studentId }, orderBy: { createdAt: 'desc' } })); } 
  catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.post("/quran-records", async (req, res) => {
  try {
    const { studentId, teacherId, trackType, surahStart, ayahStart, surahEnd, ayahEnd, pagesCount, recitationScore, tajweedErrors, teacherNotes } = req.body;
    const newRecord = await prisma.quranRecord.create({ data: { studentId, teacherId, trackType, surahStart, ayahStart: ayahStart ? parseInt(ayahStart) : null, surahEnd, ayahEnd: ayahEnd ? parseInt(ayahEnd) : null, pagesCount: parseFloat(pagesCount) || 0, recitationScore: recitationScore ? parseFloat(recitationScore) : null, tajweedErrors: tajweedErrors || [], teacherNotes } });
    await prisma.enrollment.updateMany({ where: { studentId, teacherId }, data: { progress: { increment: parseFloat(pagesCount) * 0.16 } } });
    res.status(201).json(newRecord);
  } catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

// الجلسات والحضور
app.get("/sessions", async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({ include: { course: true, teacher: true, attendances: { include: { student: true } } }, orderBy: { scheduledAt: 'asc' } });
    res.status(200).json(sessions);
  } catch (error: any) { res.status(500).json({ error: "Failed to fetch sessions" }); }
});

app.post("/sessions", async (req, res) => {
  try {
    const { courseId, teacherId, scheduledAt, durationMinutes, meetingLink, notes } = req.body;
    const newSession = await prisma.session.create({ data: { courseId, teacherId, scheduledAt: new Date(scheduledAt), durationMinutes: parseInt(durationMinutes) || 60, meetingLink, notes }, include: { course: true, teacher: true } });
    res.status(201).json(newSession);
  } catch (error: any) { res.status(500).json({ error: "Failed to create session" }); }
});

app.delete("/sessions/:id", async (req, res) => {
  try { await prisma.session.delete({ where: { id: req.params.id } }); res.status(200).json({ message: "Deleted" }); } 
  catch (error: any) { res.status(500).json({ error: "Failed" }); }
});

app.post("/sessions/:sessionId/attendance", async (req, res) => {
  try {
    const { sessionId } = req.params; const { attendances } = req.body; 
    await prisma.session.update({ where: { id: sessionId }, data: { status: 'COMPLETED' } });
    const results = [];
    for (const record of attendances) {
      const upserted = await prisma.attendance.upsert({
        where: { sessionId_studentId: { sessionId: sessionId, studentId: record.studentId } },
        update: { status: record.status }, create: { sessionId: sessionId, studentId: record.studentId, status: record.status }
      });
      results.push(upserted);
    }
    res.status(200).json({ message: "Attendance marked successfully", results });
  } catch (error: any) { res.status(500).json({ error: "Failed to mark attendance" }); }
});

// النظام المالي
app.get("/invoices", async (req, res) => {
  try { res.status(200).json(await prisma.invoice.findMany({ include: { student: true }, orderBy: { issueDate: 'desc' } })); } 
  catch (error) { res.status(500).json({ error: "Failed" }); }
});

app.post("/invoices", async (req, res) => {
  try {
    const { studentId, amount, status, dueDate, notes } = req.body;
    const newInvoice = await prisma.invoice.create({ data: { studentId, amount: parseFloat(amount), status: status || 'UNPAID', dueDate: new Date(dueDate), notes }, include: { student: true } });
    res.status(201).json(newInvoice);
  } catch (error) { res.status(500).json({ error: "Failed" }); }
});

app.put("/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params; const { status } = req.body;
    const updated = await prisma.invoice.update({ where: { id }, data: { status }, include: { student: true } });
    res.status(200).json(updated);
  } catch (error) { res.status(500).json({ error: "Failed" }); }
});

app.get("/salaries", async (req, res) => {
  try { res.status(200).json(await prisma.teacherSalary.findMany({ include: { teacher: true }, orderBy: { createdAt: 'desc' } })); } 
  catch (error) { res.status(500).json({ error: "Failed" }); }
});

app.post("/salaries", async (req, res) => {
  try {
    const { teacherId, month, year, amount, calculationMode, status } = req.body;
    const newSalary = await prisma.teacherSalary.create({ data: { teacherId, month: parseInt(month), year: parseInt(year), amount: parseFloat(amount), calculationMode, status: status || 'PAID', paymentDate: status === 'PAID' ? new Date() : null }, include: { teacher: true } });
    res.status(201).json(newSalary);
  } catch (error) { res.status(500).json({ error: "Failed" }); }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(8080, () => console.log("Server running on port 8080"));
}
export default app;