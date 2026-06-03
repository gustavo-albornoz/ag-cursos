import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const path = join(process.cwd(), 'public', 'cursos', filename);

  await writeFile(path, buffer);
  return NextResponse.json({ url: `/cursos/${filename}` });
}
