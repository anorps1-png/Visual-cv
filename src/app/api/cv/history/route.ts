import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Helper to authenticate request using Authorization Bearer token
async function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (e) {
    console.error('Auth verification error:', e);
    return null;
  }
}

const getHistoryFilePath = () => {
  const dir = path.join(process.cwd(), 'src', 'lib', 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'cvs.json');
};

const readCvs = (): any[] => {
  const filePath = getHistoryFilePath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error('Error reading cvs.json:', e);
    return [];
  }
};

const writeCvs = (cvs: any[]) => {
  const filePath = getHistoryFilePath();
  fs.writeFileSync(filePath, JSON.stringify(cvs, null, 2), 'utf-8');
};

// GET: Fetch history for the logged-in user
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const allCvs = readCvs();
    const userCvs = allCvs
      .filter((cv: any) => cv.userId === user.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, cvs: userCvs });
  } catch (error) {
    console.error('Error fetching CV history:', error);
    return NextResponse.json({ error: 'Impossible de récupérer l\'historique' }, { status: 500 });
  }
}

// POST: Save a new CV / candidate package
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { jobTitle, companyName, originalText, generatedCVUrl, coverLetterUrl, emailText } = await request.json();

    const allCvs = readCvs();
    const newCv = {
      id: crypto.randomUUID(),
      userId: user.id,
      jobTitle,
      companyName,
      originalText,
      generatedCVUrl: typeof generatedCVUrl === 'object' ? JSON.stringify(generatedCVUrl) : generatedCVUrl,
      coverLetterUrl,
      emailText,
      createdAt: new Date().toISOString()
    };

    allCvs.push(newCv);
    writeCvs(allCvs);

    return NextResponse.json({ success: true, cv: newCv });
  } catch (error) {
    console.error('Error saving CV to history:', error);
    return NextResponse.json({ error: 'Impossible d\'enregistrer dans l\'historique' }, { status: 500 });
  }
}

// DELETE: Remove a CV from history
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cvId = searchParams.get('id');

    if (!cvId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const allCvs = readCvs();
    const existing = allCvs.find((cv: any) => cv.id === cvId);

    if (!existing) {
      return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 });
    }

    const updatedCvs = allCvs.filter((cv: any) => cv.id !== cvId);
    writeCvs(updatedCvs);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return NextResponse.json({ error: 'Impossible de supprimer de l\'historique' }, { status: 500 });
  }
}
