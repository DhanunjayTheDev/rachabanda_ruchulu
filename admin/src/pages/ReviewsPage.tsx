
import { useState, useEffect } from 'react';
import { reviewsAPI } from '@/lib/api';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await reviewsAPI.getAll();
        setReviews(res.data?.reviews || res.data || []);
      } catch {}
      setLoading(false);
    };
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((r: any) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch =
      (r.customerName || r.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.foodName || r.food?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r: any) => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  const handleDelete = async (id: string) => {
    try {
      await reviewsAPI.delete(id);
      setReviews(reviews.filter((r: any) => (r._id || r.id) !== id));
    } catch {}
  };

  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const statusColors: Record<string, string> = {
    published: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    flagged: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const getName = (r: any) => r.customerName || r.user?.name || 'Customer';
  const getFoodName = (r: any) => r.foodName || r.food?.name || 'Food Item';
  const getDate = (r: any) => r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-gray-400 text-sm mt-1">Manage customer reviews and ratings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-5 border border-white/10 text-center">
          <p className="text-3xl font-bold text-primary-gold">{averageRating}</p>
          <p className="text-sm text-gray-400 mt-1">Average Rating</p>
          <p className="text-primary-gold text-lg mt-1">{renderStars(Math.round(Number(averageRating)))}</p>
        </div>
        <div className="glass rounded-2xl p-5 border border-white/10 text-center">
          <p className="text-3xl font-bold text-white">{reviews.length}</p>
          <p className="text-sm text-gray-400 mt-1">Total Reviews</p>
        </div>
        <div className="glass rounded-2xl p-5 border border-white/10 text-center">
          <p className="text-3xl font-bold text-green-400">{reviews.filter((r: any) => r.rating >= 4).length}</p>
          <p className="text-sm text-gray-400 mt-1">Positive (4-5★)</p>
        </div>
        <div className="glass rounded-2xl p-5 border border-white/10 text-center">
          <p className="text-3xl font-bold text-red-400">{reviews.filter((r: any) => r.status === 'flagged').length}</p>
          <p className="text-sm text-gray-400 mt-1">Flagged</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/10 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Rating Distribution</h2>
        <div className="space-y-3">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm text-gray-400 w-8">{star}★</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-gold to-accent-gold rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
              </div>
              <span className="text-sm text-gray-400 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..." className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-gold/50 focus:outline-none transition-all" />
        <div className="flex gap-2">
          {['all', 'published', 'pending', 'flagged'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? 'bg-primary-gold/15 text-primary-gold border border-primary-gold/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading reviews...</div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review: any) => (
            <div key={review._id || review.id} className="glass rounded-2xl p-5 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-gold to-accent-gold flex items-center justify-center text-dark-bg font-bold text-sm">{getName(review).charAt(0)}</div>
                  <div>
                    <h3 className="text-white font-medium">{getName(review)}</h3>
                    <p className="text-gray-500 text-xs">{getDate(review)}</p>
                  </div>
                </div>
                {review.status && <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${statusColors[review.status] || statusColors.pending}`}>{review.status}</span>}
              </div>
              <div className="pl-12">
                <p className="text-sm text-gray-400 mb-1"><span className="text-primary-gold">{renderStars(review.rating || 0)}</span> · {getFoodName(review)}</p>
                <p className="text-gray-300 text-sm">{review.review || review.comment}</p>
              </div>
              <div className="flex gap-2 mt-3 pl-12">
                <button onClick={() => handleDelete(review._id || review.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">Delete</button>
              </div>
            </div>
          ))}
          {filteredReviews.length === 0 && <div className="text-center py-12 text-gray-500"><p className="text-4xl mb-3">⭐</p><p>No reviews found</p></div>}
        </div>
      )}
    </div>
  );
}
