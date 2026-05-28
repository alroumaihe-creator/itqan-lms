import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

// تهيئة الاتصال بقاعدة البيانات
const prisma = new PrismaClient();

// تهيئة تطبيق Express
const app = express();

// السماح بالاتصال من الواجهة الأمامية (Frontend)
app.use(cors({ origin: true }));
app.use(express.json());

// 1. مسار اختباري للتأكد من عمل الخادم
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "success", 
    message: "Itqan Academy API is running perfectly on Render!" 
  });
});

// 2. مسار لجلب قائمة الطلاب
app.get("/students", async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { user: true }
    });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// تحديد المنفذ (Port) وتمريره للسيرفر
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});