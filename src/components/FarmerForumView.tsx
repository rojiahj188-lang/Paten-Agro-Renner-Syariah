import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Share2,
  PlusCircle,
  Filter,
  Search,
  CheckCircle2,
  Send,
  Sparkles,
  MapPin,
  Tag,
  Award,
  Image as ImageIcon,
  Camera,
  X,
  User,
  Heart,
  Star,
  Trophy,
  Lightbulb,
  TrendingUp,
  Check,
  ChevronDown
} from 'lucide-react';
import { ForumPost, ForumComment } from '../types';
import {
  getForumPosts,
  addForumPost,
  likeForumPost,
  rateForumPost,
  addForumComment,
  addNotification
} from '../utils/offlineStorage';
import { formatNumber } from '../utils/calculatorEngine';

type SortOption = 'rating' | 'likes' | 'latest';

export const FarmerForumView: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>(() => getForumPosts());
  const [activeCategory, setActiveCategory] = useState<string>('Semua Topik');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<{ [postId: string]: number }>({});
  const [selectedPhotoPreviewModal, setSelectedPhotoPreviewModal] = useState<{ url: string; title: string; caption?: string } | null>(null);

  // Form State for New Post
  const [formAuthor, setFormAuthor] = useState<string>('Petani Mitra Renner');
  const [formLocation, setFormLocation] = useState<string>('Lombok Tengah, NTB');
  const [formRole, setFormRole] = useState<'Petani Mitra' | 'Agronomis Renner' | 'Ketua Gapoktan' | 'Peternak'>('Petani Mitra');
  const [formCategory, setFormCategory] = useState<'Tips & Teknik' | 'Testimoni & Panen' | 'Tanya Hama & Solusi' | 'Peternakan'>('Testimoni & Panen');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formCommodity, setFormCommodity] = useState<string>('Tembakau');
  const [formSelectedProducts, setFormSelectedProducts] = useState<string[]>(['Paten Gold']);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);

  // Specific state for Paten Gold harvest success story
  const [isSharingPatenGoldSuccess, setIsSharingPatenGoldSuccess] = useState<boolean>(true);
  const [formYieldBefore, setFormYieldBefore] = useState<number>(1200);
  const [formYieldAfter, setFormYieldAfter] = useState<number>(1650);
  const [formHarvestCaption, setFormHarvestCaption] = useState<string>('Hasil panen tembakau super tebal berkat aplikasi Paten Gold.');

  const categories = [
    'Semua Topik',
    '💡 Tips & Trik Komunitas',
    '✨ Panen Paten Gold',
    'Testimoni & Panen',
    'Tanya Hama & Solusi',
    'Peternakan'
  ];

  const availableProducts = [
    'Paten Gold',
    'Paten Hijau',
    'Paten Imun',
    'Colpro Colostrum',
    'Revit Apel Ginseng'
  ];

  // Sample photo presets for quick realistic testing
  const harvestPhotoPresets = [
    {
      label: '🌾 Padi Emas Narmada',
      crop: 'Padi Sawah',
      caption: 'Malai padi bernas kuning emas menjuntai lebat dengan Paten Gold',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280" viewBox="0 0 480 280"><defs><linearGradient id="bgPadi" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%231e293b"/><stop offset="100%25" stop-color="%230f172a"/></linearGradient><linearGradient id="riceGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23fef08a"/><stop offset="100%25" stop-color="%23eab308"/></linearGradient></defs><rect width="480" height="280" fill="url(%23bgPadi)"/><path d="M100 280 Q190 70 330 90 Q390 110 360 190" stroke="url(%23riceGrad)" stroke-width="26" fill="none" stroke-linecap="round"/><circle cx="270" cy="85" r="14" fill="%23f59e0b"/><circle cx="310" cy="90" r="14" fill="%23f59e0b"/><circle cx="350" cy="105" r="14" fill="%23f59e0b"/><rect x="24" y="24" width="180" height="32" rx="16" fill="%23059669"/><text x="40" y="45" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff">✨ PANEN PATEN GOLD</text><text x="24" y="235" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23fef08a">Padi Sawah Organik Narmada</text><text x="24" y="258" font-family="sans-serif" font-size="12" fill="%23cbd5e1">Hasil 8.4 Ton/Ha (+61%) • Bebas Hampa</text></svg>'
    },
    {
      label: '🍂 Tembakau Praya NTB',
      crop: 'Tembakau Virginia',
      caption: 'Daun tembakau tebal rajangan warna kuning keemasan rendemen grade A',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280" viewBox="0 0 480 280"><defs><linearGradient id="bgTb" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%231e293b"/><stop offset="100%25" stop-color="%230f172a"/></linearGradient><linearGradient id="tbGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23f59e0b"/><stop offset="100%25" stop-color="%23d97706"/></linearGradient></defs><rect width="480" height="280" fill="url(%23bgTb)"/><path d="M120 250 Q240 60 360 250" fill="url(%23tbGold)" opacity="0.9"/><path d="M160 250 Q240 100 320 250" fill="%23fbbf24"/><path d="M240 70 L240 260" stroke="%2378350f" stroke-width="4"/><rect x="24" y="24" width="180" height="32" rx="16" fill="%23059669"/><text x="40" y="45" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff">✨ PANEN PATEN GOLD</text><text x="24" y="235" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23fef08a">Tembakau Emas Praya Timur</text><text x="24" y="258" font-family="sans-serif" font-size="12" fill="%23cbd5e1">Rendemen +35% • Daun Elastis Rajangan Super</text></svg>'
    },
    {
      label: '🌽 Jagung Super Dompu',
      crop: 'Jagung Hibrida',
      caption: '2 tongkol jagung raksasa per pohon terisi penuh sampai ujung',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280" viewBox="0 0 480 280"><defs><linearGradient id="bgJg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%231e293b"/><stop offset="100%25" stop-color="%230f172a"/></linearGradient><linearGradient id="cornG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23facc15"/><stop offset="100%25" stop-color="%23ca8a04"/></linearGradient></defs><rect width="480" height="280" fill="url(%23bgJg)"/><ellipse cx="210" cy="160" rx="42" ry="105" fill="url(%23cornG)" transform="rotate(-15 210 160)"/><ellipse cx="290" cy="150" rx="42" ry="105" fill="url(%23cornG)" transform="rotate(15 290 150)"/><rect x="24" y="24" width="180" height="32" rx="16" fill="%23059669"/><text x="40" y="45" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff">✨ PANEN PATEN GOLD</text><text x="24" y="235" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23fef08a">Jagung Pipil Dompu NTB</text><text x="24" y="258" font-family="sans-serif" font-size="12" fill="%23cbd5e1">Produktivitas 9.5 Ton/Ha • Tongkol Bebas Ompong</text></svg>'
    },
    {
      label: '🧅 Bawang Merah Bima',
      crop: 'Bawang Merah Super',
      caption: 'Umbi bawang merah padat merah menyala tanpa moler dan busuk akar',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280" viewBox="0 0 480 280"><defs><linearGradient id="bgBw" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%231e293b"/><stop offset="100%25" stop-color="%230f172a"/></linearGradient><linearGradient id="onionG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23e11d48"/><stop offset="100%25" stop-color="%239f1239"/></linearGradient></defs><rect width="480" height="280" fill="url(%23bgBw)"/><ellipse cx="190" cy="170" rx="45" ry="55" fill="url(%23onionG)"/><ellipse cx="270" cy="165" rx="50" ry="60" fill="url(%23onionG)"/><rect x="24" y="24" width="180" height="32" rx="16" fill="%23059669"/><text x="40" y="45" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff">✨ PANEN PATEN GOLD</text><text x="24" y="235" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23fef08a">Bawang Merah Sape Bima</text><text x="24" y="258" font-family="sans-serif" font-size="12" fill="%23cbd5e1">12 Ton/Ha • Umbi Padat Warna Merah Mengkilap</text></svg>'
    }
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredPosts = useMemo(() => {
    let result = posts.filter((post) => {
      // Category filter
      let matchCat = true;
      if (activeCategory === '💡 Tips & Trik Komunitas') {
        matchCat = post.isCommunityTip === true || post.category === 'Tips & Teknik';
      } else if (activeCategory === '✨ Panen Paten Gold') {
        matchCat = post.harvestSuccessStory?.isPatenGoldSuccess === true || post.productsUsed.includes('Paten Gold');
      } else if (activeCategory !== 'Semua Topik') {
        matchCat = post.category === activeCategory;
      }

      // Search query
      const matchSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.commodityTag && post.commodityTag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchSearch;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating') {
        const ratingA = a.ratings?.averageRating || 0;
        const ratingB = b.ratings?.averageRating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.ratings?.totalRatings || 0) - (a.ratings?.totalRatings || 0);
      }
      if (sortBy === 'likes') {
        return b.likesCount - a.likesCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [posts, activeCategory, searchQuery, sortBy]);

  const handleLike = (postId: string) => {
    const updated = likeForumPost(postId);
    setPosts(updated);
  };

  const handleRate = (postId: string, ratingValue: number) => {
    const updated = rateForumPost(postId, ratingValue);
    setPosts(updated);
    triggerToast(`⭐ Terima kasih! Anda memberi rating ${ratingValue} Bintang untuk tips ini.`);
  };

  const handleAddCommentSubmit = (postId: string) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    const updated = addForumComment(postId, {
      authorName: formAuthor || 'Petani Renner',
      authorLocation: formLocation || 'Nusantara',
      content: text
    });

    setPosts(updated);
    setNewCommentText((prev) => ({ ...prev, [postId]: '' }));
    triggerToast('Komentar berhasil dikirim!');
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) return;

    let harvestSuccessStory: ForumPost['harvestSuccessStory'] = undefined;
    if (isSharingPatenGoldSuccess) {
      const increasePct = formYieldBefore > 0
        ? Math.round(((formYieldAfter - formYieldBefore) / formYieldBefore) * 100)
        : 35;

      harvestSuccessStory = {
        isPatenGoldSuccess: true,
        cropName: formCommodity,
        yieldBeforeKg: formYieldBefore,
        yieldAfterKg: formYieldAfter,
        increasePercent: increasePct,
        photoCaption: formHarvestCaption || `Keberhasilan panen ${formCommodity} berkat aplikasi rutin Paten Gold.`
      };
    }

    const newPost = addForumPost({
      authorName: formAuthor,
      authorLocation: formLocation,
      authorRole: formRole,
      avatarEmoji: formCategory === 'Peternakan' ? '🐂' : '🌾',
      title: formTitle,
      content: formContent,
      category: formCategory,
      commodityTag: formCommodity,
      productsUsed: formSelectedProducts,
      imageUrl: formImagePreview || undefined,
      isVerified: true,
      isCommunityTip: true,
      harvestSuccessStory,
      ratings: {
        averageRating: 5.0,
        totalRatings: 1,
        userRating: 5
      }
    });

    const updated = getForumPosts();
    setPosts(updated);
    setShowCreateModal(false);

    // Reset Form
    setFormTitle('');
    setFormContent('');
    setFormImagePreview(null);

    addNotification({
      title: '🌾 Tips Panen Paten Gold Berhasil Dimuat',
      message: `Tips keberhasilan panen "${newPost.title}" telah dipublikasikan ke Komunitas Petani.`,
      type: 'jadwal',
      priority: 'normal'
    });

    triggerToast('Tips & Foto Panen Anda berhasil dipublikasikan!');
  };

  const toggleProductSelection = (prod: string) => {
    if (formSelectedProducts.includes(prod)) {
      setFormSelectedProducts(formSelectedProducts.filter((p) => p !== prod));
    } else {
      setFormSelectedProducts([...formSelectedProducts, prod]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormImagePreview(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-5 pb-24 text-slate-800 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-emerald-950/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl backdrop-blur-md animate-in fade-in duration-200 border border-emerald-500/80 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden border border-emerald-700/50">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-56 h-56 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-md mb-2.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
            <span>Sistem Tips & Trik Komunitas Petani Paten Gold</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
            Forum & Berbagi Tips Panen
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1.5 leading-relaxed">
            Wadah interaksi antar petani se-Nusantara: bagikan foto riil keberhasilan panen dengan pupuk <strong>Paten Gold</strong>, berikan rating bintang pada tips yang paling membantu, dan diskusikan rahasia efisiensi biaya tani hingga 70%.
          </p>
        </div>
      </div>

      {/* HIGHLIGHT: Showcase Tips & Trik Paling Membantu (Rating 4.8 - 5.0) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-teal-500/10 border border-amber-300/60 dark:border-amber-500/30 rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-4 h-4 text-amber-100" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
                <span>Tips & Trik Terfavorit Petani</span>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-300 dark:border-amber-700">
                  Rating Tertinggi
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Peringkat tips teruji yang dinilai paling bermanfaat oleh komunitas petani
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveCategory('💡 Tips & Trik Komunitas');
              setSortBy('rating');
            }}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Lihat Semua Tips Berbintang</span>
            <span>→</span>
          </button>
        </div>

        {/* Quick Highlights Scroll */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {posts.filter(p => p.ratings && p.ratings.averageRating >= 4.8).slice(0, 3).map(topPost => (
            <div
              key={'top-' + topPost.id}
              onClick={() => {
                const el = document.getElementById(topPost.id);
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-amber-400 dark:hover:border-amber-500/60 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                  {topPost.authorName}
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{topPost.ratings?.averageRating.toFixed(1)}</span>
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                {topPost.title}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{topPost.commodityTag}</span>
                <span>{topPost.ratings?.totalRatings} Petani Menilai</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar: Search, Category Filters, Sort, Create Button */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tips takaran tangki, hasil panen Paten Gold, daerah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Urutkan:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-emerald-600"
            >
              <option value="rating">⭐ Rating Tertinggi (Paling Membantu)</option>
              <option value="likes">❤️ Paling Populer (Suka)</option>
              <option value="latest">🕒 Diskusi Terbaru</option>
            </select>
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => {
              setIsSharingPatenGoldSuccess(true);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 active:scale-95"
          >
            <Camera className="w-4 h-4 text-amber-300" />
            <span>Bagikan Tips & Foto Panen</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada diskusi untuk kriteria ini</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Jadilah yang pertama membagikan tips aplikasi pupuk Paten Gold Anda!</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isCommentsOpen = expandedCommentsPostId === post.id;
            const avgRating = post.ratings?.averageRating || 5.0;
            const totalRatings = post.ratings?.totalRatings || 0;
            const userRating = post.ratings?.userRating;
            const isTopRatedTip = avgRating >= 4.8;
            const currentHover = hoverRating[post.id] || 0;

            return (
              <div
                key={post.id}
                id={post.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border transition-all shadow-xs space-y-4 ${
                  post.harvestSuccessStory?.isPatenGoldSuccess
                    ? 'border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {/* Author Bar & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-lg font-bold shadow-2xs border border-emerald-200 dark:border-emerald-900">
                      {post.avatarEmoji || '👨‍🌾'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100">
                          {post.authorName}
                        </h4>
                        {post.isVerified && (
                          <span title="Terverifikasi Mitra Renner Syariah">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {post.authorRole}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{post.authorLocation}</span>
                        <span>•</span>
                        <span>{post.createdAt}</span>
                      </p>
                    </div>
                  </div>

                  {/* Category & Top Badge */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {isTopRatedTip && (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        <span>Tips Terfavorit</span>
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Title & Body */}
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50 font-['Outfit']">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* SPECIAL VIP BANNER: Keberhasilan Panen Paten Gold */}
                {post.harvestSuccessStory?.isPatenGoldSuccess && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-300 dark:border-emerald-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-extrabold text-emerald-800 dark:text-emerald-300">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Bukti Panen Paten Gold: {post.harvestSuccessStory.cropName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                        +{post.harvestSuccessStory.increasePercent}% Kenaikan Hasil
                      </span>
                    </div>

                    {(post.harvestSuccessStory.yieldBeforeKg || post.harvestSuccessStory.yieldAfterKg) && (
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Pola Kimia Biasa:</span>
                          <span className="font-extrabold text-slate-700 dark:text-slate-300">
                            {formatNumber(post.harvestSuccessStory.yieldBeforeKg || 0)} kg
                          </span>
                        </div>
                        <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-300/80 dark:border-emerald-800">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold uppercase">Pola Paten Gold:</span>
                          <span className="font-black text-emerald-700 dark:text-emerald-300 font-['Outfit']">
                            {formatNumber(post.harvestSuccessStory.yieldAfterKg || 0)} kg
                          </span>
                        </div>
                      </div>
                    )}

                    {post.harvestSuccessStory.photoCaption && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        "{post.harvestSuccessStory.photoCaption}"
                      </p>
                    )}
                  </div>
                )}

                {/* Attached Photo Preview if any */}
                {post.imageUrl && (
                  <div
                    onClick={() =>
                      setSelectedPhotoPreviewModal({
                        url: post.imageUrl!,
                        title: post.title,
                        caption: post.harvestSuccessStory?.photoCaption
                      })
                    }
                    className="rounded-2xl overflow-hidden max-h-80 border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center cursor-pointer group relative"
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="max-h-80 w-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-2xs">
                      <Camera className="w-4 h-4 text-amber-300" />
                      <span>Klik untuk perbesar foto</span>
                    </div>
                  </div>
                )}

                {/* Commodity Tag & Products Used */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {post.commodityTag && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {post.commodityTag}
                    </span>
                  )}
                  {post.productsUsed.map((prod, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                    >
                      ✓ {prod}
                    </span>
                  ))}
                </div>

                {/* COMMUNITY RATING BAR: Beri Rating Tips Ini */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Bermanfaat? Nilai Tips Ini:
                    </span>
                    {/* 5 Interactive Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (currentHover || userRating || 0) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating((prev) => ({ ...prev, [post.id]: star }))}
                            onMouseLeave={() => setHoverRating((prev) => ({ ...prev, [post.id]: 0 }))}
                            onClick={() => handleRate(post.id, star)}
                            className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
                            title={`Beri ${star} Bintang`}
                          >
                            <Star
                              className={`w-4 h-4 transition-colors ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rating Score Summary */}
                  <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
                    <span className="font-black text-amber-600 dark:text-amber-400 font-['Outfit'] text-sm flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{avgRating.toFixed(1)} / 5.0</span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      ({totalRatings} penilaian petani)
                    </span>
                    {userRating && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        Anda: {userRating}★
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Footer: Like, Comment, Share */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-4">
                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 font-bold transition-colors ${
                        post.isLiked
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likesCount} Suka</span>
                    </button>

                    {/* Comment Toggle Button */}
                    <button
                      onClick={() => setExpandedCommentsPostId(isCommentsOpen ? null : post.id)}
                      className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount} Komentar</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      triggerToast('Tautan tips disalin ke papan klip!');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 text-xs font-semibold"
                    title="Bagikan tips ini"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Bagikan</span>
                  </button>
                </div>

                {/* Expanded Comments Section */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Diskusi Komentar ({post.comments.length})
                    </h5>

                    {/* Comment List */}
                    <div className="space-y-2">
                      {post.comments.map((comm) => (
                        <div
                          key={comm.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-slate-900 dark:text-slate-100">
                              {comm.authorName}{' '}
                              <span className="text-[10px] font-normal text-slate-500">
                                ({comm.authorLocation})
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400">{comm.createdAt}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {comm.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Tulis tanggapan atau pertanyaan untuk tips ini..."
                        value={newCommentText[post.id] || ''}
                        onChange={(e) =>
                          setNewCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddCommentSubmit(post.id);
                        }}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        onClick={() => handleAddCommentSubmit(post.id)}
                        className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors"
                        title="Kirim Komentar"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Tulis Tips & Bagikan Foto Panen Paten Gold */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Bagikan Tips & Foto Keberhasilan Panen</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dokumentasi Anda akan membantu ribuan rekan petani mitra di seluruh Indonesia
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Petani / Mitra</label>
                  <input
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Daerah / Kabupaten</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Praya, Lombok Tengah"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Komoditi Tanaman</label>
                  <input
                    type="text"
                    placeholder="Contoh: Padi Sawah / Tembakau / Jagung"
                    value={formCommodity}
                    onChange={(e) => setFormCommodity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Topik</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Testimoni & Panen">🏆 Testimoni & Panen</option>
                    <option value="Tips & Teknik">💡 Tips & Teknik Aplikasi</option>
                    <option value="Tanya Hama & Solusi">🩺 Tanya Hama & Solusi</option>
                    <option value="Peternakan">🐂 Peternakan Ternak</option>
                  </select>
                </div>
              </div>

              {/* TOGGLE: Bagikan Data Keberhasilan Panen Paten Gold */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-900 dark:text-emerald-200">
                  <input
                    type="checkbox"
                    checked={isSharingPatenGoldSuccess}
                    onChange={(e) => setIsSharingPatenGoldSuccess(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Sertakan Data Komparasi Hasil Panen Paten Gold</span>
                </label>

                {isSharingPatenGoldSuccess && (
                  <div className="space-y-2 pt-1 border-t border-emerald-200 dark:border-emerald-800/80">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Panen Kimia Dulu (kg)
                        </label>
                        <input
                          type="number"
                          value={formYieldBefore}
                          onChange={(e) => setFormYieldBefore(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-0.5">
                          Panen Paten Gold (kg)
                        </label>
                        <input
                          type="number"
                          value={formYieldAfter}
                          onChange={(e) => setFormYieldAfter(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-700 rounded-xl px-2.5 py-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-extrabold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Tips / Hasil Panen</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rahasia Panen Padi 8.4 Ton/Ha dengan Kocor Paten Gold Pagi Hari"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Produk Paten yang Digunakan</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableProducts.map((p) => {
                    const isSelected = formSelectedProducts.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleProductSelection(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Uraian Tips & Cara Aplikasi (Dosis, Jam Semprot Stomata, dsb.)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Jelaskan takaran sachet per tangki, waktu semprot terbaik (misal 06.30 - 08.30), interval hari, dan perubahan kondisi tanaman..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Photo Upload & Presets */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Foto Keberhasilan Panen Paten Gold
                </label>

                {/* Preset Fast Picker */}
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Gunakan Contoh Foto Cepat:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {harvestPhotoPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setFormImagePreview(preset.url);
                          setFormCommodity(preset.crop);
                          setFormHarvestCaption(preset.caption);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[10px] font-bold transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Unggah dari HP / Kamera</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {formImagePreview && (
                    <button
                      type="button"
                      onClick={() => setFormImagePreview(null)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                {formImagePreview && (
                  <div className="mt-2 rounded-2xl overflow-hidden max-h-40 w-full border border-slate-200 dark:border-slate-700">
                    <img src={formImagePreview} alt="Preview" className="h-40 w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm transition-colors"
                >
                  Publikasikan Tips & Panen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Perbesar Foto Panen */}
      {selectedPhotoPreviewModal && (
        <div
          onClick={() => setSelectedPhotoPreviewModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-3xl max-w-2xl w-full p-4 space-y-3 border border-slate-800 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-sm font-['Outfit'] truncate max-w-[80%]">
                {selectedPhotoPreviewModal.title}
              </h4>
              <button
                onClick={() => setSelectedPhotoPreviewModal(null)}
                className="p-1 rounded-xl hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedPhotoPreviewModal.url}
                alt="Dokumentasi Panen"
                className="max-h-[60vh] w-full object-contain"
              />
            </div>
            {selectedPhotoPreviewModal.caption && (
              <p className="text-xs text-slate-300 italic text-center">
                "{selectedPhotoPreviewModal.caption}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
