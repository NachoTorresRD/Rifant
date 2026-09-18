import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, setAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Por favor ingresa tu correo y contraseña de administrador',
        },
        { status: 400 }
      );
    }

    const check = validateAdminCredentials(email, password);
    if (!check.valid || !check.email) {
      return NextResponse.json(
        {
          success: false,
          error: check.error || 'Credenciales de acceso no válidas',
        },
        { status: 401 }
      );
    }

    await setAdminSession(check.email);

    return NextResponse.json({
      success: true,
      email: check.email,
      message: 'Sesión iniciada con éxito',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
