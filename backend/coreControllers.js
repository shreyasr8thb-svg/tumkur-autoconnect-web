// controllers/coreControllers.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { Configuration, OpenAIApi } = require('openai');
const crypto = require('crypto');

// Utility: Haversine formula for distance in meters
const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// 1. Geo-Fenced Attendance API
exports.logAttendance = async(req, res) => {
    try {
        const { workerId, lat, lng, factoryId } = req.body;

        const factory = await prisma.factoryProfile.findUnique({ where: { id: factoryId } });
        if (!factory) return res.status(404).json({ error: 'Factory not found' });

        const distance = getDistanceFromLatLonInM(lat, lng, factory.latitude, factory.longitude);
        const isValid = distance <= factory.geofenceRadius;

        const attendance = await prisma.attendance.create({
            data: {
                workerId,
                lat,
                lng,
                isValid
            }
        });

        res.status(200).json({ success: true, distance, isValid, attendance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. AI Job Matching API
exports.matchJob = async(req, res) => {
    try {
        const { workerId, jobId } = req.body;

        const worker = await prisma.workerProfile.findUnique({ where: { id: workerId } });
        const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });

        // Note: In production, instantiate OpenAI client with secure keys
        // const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

        const prompt = `Compare Worker Skills: ${worker.skills.join(', ')} (Experience: ${worker.experience} months) against Job Requirements: ${job.requiredSkills.join(', ')}. Return only a JSON object with a 'score' property between 0 and 100 representing the match percentage.`;

        // Mocked AI Response for architecture template
        // const aiResponse = await openai.createChatCompletion({ ... })
        const mockAiScore = 85.5;

        const application = await prisma.application.upsert({
            where: { workerId_jobId: { workerId, jobId } },
            update: { matchScore: mockAiScore },
            create: { workerId, jobId, matchScore: mockAiScore }
        });

        res.status(200).json({ success: true, application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Secure File Upload API (S3 Presigned URLs)
const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.getPresignedUploadUrl = async(req, res) => {
    try {
        const { userId, fileType, docType } = req.body;

        // docType could be "RESUME" or "GOV_ID" (e.g., [Aadhaar Redacted] or other certificates)
        const fileExtension = fileType.split('/')[1];
        const fileName = `${userId}/${docType}_${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            ContentType: fileType,
            ServerSideEncryption: 'AES256'
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const secureFileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        // Save record to database
        await prisma.document.create({
            data: { userId, docType, fileUrl: secureFileUrl }
        });

        res.status(200).json({ uploadUrl, secureFileUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};