export default function ReviewsTab() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in max-w-4xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews & Ratings</h2>
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
        <div className="text-4xl mb-4">⭐</div>
        <h3 className="text-gray-900 font-bold text-lg mb-2">No Reviews Yet</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          When customers leave reviews for your business, they will appear here. Currently, your public profile displays Google Reviews automatically if you have linked your Place ID.
        </p>
      </div>
    </div>
  );
}
