export default function OrderSuccess() {
    return (
        <div className="max-w-3xl mx-auto p-6 text-center">
            <h1 className="text-2xl font-bold text-green-600">🎉 Your order is already placed! 🎉</h1>
            <p className="mt-4">Thank you for your purchase. We will send you a confirmation email with your order details.</p>
            <a href="/" className="mt-6 inline-block bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition">
                Back to home
            </a>
        </div>
    );
}
