'use client';
import { useRouter } from 'next/navigation';

export default function CheckoutButton({ courseId, userId }: { courseId: string; userId: string }) {
  const router = useRouter();

  const handleBuyMock = async () => {
    const res = await fetch('http://localhost:3000/checkout/mock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, userId }),
    });

    if (res.ok) {
      alert('¡Pago exitoso!');
      router.push(`/watch/${courseId}`);
    } else {
      alert('Error al procesar la compra');
    }
  };

  return (
    <button
      onClick={handleBuyMock}
      className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition"
    >
      Comprar Curso (Test)
    </button>
  );
}
