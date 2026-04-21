/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, type ReactNode } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell 
} from 'recharts';
import { 
  Instagram, TrendingUp, Users, Play, Heart, MessageCircle, Share2, 
  ChevronDown, ChevronUp, Calendar, ArrowUpRight, BarChart3, AppWindow,
  MessageSquare, Sparkles, LayoutDashboard, Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import reelsCsvRaw from '../scraped_s.bilinkis.csv?raw';

// --- MOCK DATA ---

type CsvRow = Record<string, string>;

const parseCsv = (source: string): CsvRow[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }

      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());

  return rows
    .slice(1)
    .filter((values) => values.some((value) => value.trim() !== ''))
    .map((values) => {
      const entry: CsvRow = {};

      headers.forEach((header, headerIndex) => {
        entry[header] = (values[headerIndex] ?? '').trim();
      });

      return entry;
    });
};

const buildVideoKey = (video: { date: string; likes: number; comments_count: number; views: number }) => (
  `${video.date}|${video.likes}|${video.comments_count}|${video.views}`
);

const csvThumbnailByStats = (() => {
  const rows = parseCsv(reelsCsvRaw);
  const lookup = new Map<string, string>();

  rows.forEach((row) => {
    const publicationDate = row.publication_date?.slice(0, 10);
    const likes = Number(row.like_count ?? 0);
    const comments = Number(row.comment_count ?? 0);
    const views = Number(row.play_count || row.view_count || 0);
    const imageUrl = row.image_url;

    if (!publicationDate || !imageUrl) {
      return;
    }

    const key = `${publicationDate}|${likes}|${comments}|${views}`;
    lookup.set(key, imageUrl);
  });

  return lookup;
})();

const MOCK_VIDEOS = [
  {
    id: '1',
    title: 'Ser padre te da algo MUCHO más importante que felicidad! Feliz día a todos los padres, presentes y futuros!',
    thumbnail: 'https://picsum.photos/seed/video-1/400/600',
    views: 2017855,
    likes: 67487,
    comments_count: 1504,
    shares: 0,
    engagement: 3.4,
    date: '2025-06-15',
    comments: [
      { user: 'fede.tech', text: 'Excelente forma de explicar riesgos y oportunidades de la IA.', sentiment: 'positive' },
      { user: 'ana_educa', text: 'Me gustaria una parte 2 enfocada en educacion.', sentiment: 'positive' },
      { user: 'martin_q', text: 'No coincido con el horizonte temporal, pero gran debate.', sentiment: 'neutral' }
    ]
  },
  {
    id: '2',
    title: '¿Y si vos también obedecieras sin darte cuenta? Un grupo de alumnos creía que jamás obedecerían...',
    thumbnail: 'https://picsum.photos/seed/video-2/400/600',
    views: 2293392,
    likes: 112729,
    comments_count: 2684,
    shares: 0,
    engagement: 5.0,
    date: '2025-04-11',
    comments: [
      { user: 'lau_data', text: 'Muy claro el ejemplo sobre automatizacion en oficinas.', sentiment: 'positive' },
      { user: 'dario.producto', text: '¿Tenes bibliografia para profundizar?', sentiment: 'neutral' },
      { user: 'sofi.hr', text: 'Me llevo ideas concretas para mi equipo.', sentiment: 'positive' }
    ]
  },
  {
    id: '3',
    title: 'Descubrir quién sos y qué querés hacer en la vida no es solamente una búsqueda introspectiva. Probá...',
    thumbnail: 'https://picsum.photos/seed/video-3/400/600',
    views: 4094469,
    likes: 227043,
    comments_count: 1263,
    shares: 0,
    engagement: 5.6,
    date: '2024-10-23',
    comments: [
      { user: 'juli.analitycs', text: 'La matriz mental que mostraste me sirvio muchisimo.', sentiment: 'positive' },
      { user: 'mica.tech', text: 'Gran contenido, aunque me quede con dudas en la parte final.', sentiment: 'neutral' },
      { user: 'cami.startups', text: 'Este formato de carrusel + reel funciona muy bien.', sentiment: 'positive' }
    ]
  },
  {
    id: '4',
    title: 'Claude Code es una herramienta que analiza, toma decisiones y te trae la tarea realizada...',
    thumbnail: 'https://picsum.photos/seed/video-4/400/600',
    views: 575571,
    likes: 16826,
    comments_count: 340,
    shares: 0,
    engagement: 3.0,
    date: '2026-04-20',
    comments: [
      { user: 'profe_maria', text: 'Gracias por poner educacion en el centro del debate.', sentiment: 'positive' },
      { user: 'franco_dev', text: 'Me gustaria ver un episodio sobre evaluacion con IA.', sentiment: 'positive' }
    ]
  },
  {
    id: '5',
    title: 'Vivimos bajo la lupa de un crítico interno que no nos perdona ni una ¿Por qué permitís que esa voz...',
    thumbnail: 'https://picsum.photos/seed/video-5/400/600',
    views: 107133,
    likes: 3127,
    comments_count: 23,
    shares: 0,
    engagement: 2.9,
    date: '2026-04-20',
    comments: [
      { user: 'vale.innova', text: 'Gran disparador, este reel deberia verlo todo lider de equipo.', sentiment: 'positive' },
      { user: 'pablo_pensar', text: 'Me encanto el enfoque etico del cierre.', sentiment: 'positive' }
    ]
  },
  {
    id: '6',
    title: 'Mientras algunos se recargan con el ruido, otros, en cambio, necesitan silencio para rendir al...',
    thumbnail: 'https://picsum.photos/seed/video-6/400/600',
    views: 160163,
    likes: 5254,
    comments_count: 67,
    shares: 0,
    engagement: 3.3,
    date: '2026-04-19',
    comments: [
      { user: 'diegoridzon', text: 'Yo me compro siempre medias negras así no pierdo el par siempre tengo', sentiment: 'positive'},
      { user: 'p_ans26', text: 'La intuición está basado en experiencias previas. No viene de la nada.', sentiment: 'positive' }
    ]
  },
  {
    id: '7',
    title: '¿Viste esa gente que habla con una seguridad total pero no tiene ni la más pálida idea de lo que...',
    thumbnail: 'https://picsum.photos/seed/video-7/400/600',
    views: 248410,
    likes: 6723,
    comments_count: 107,
    shares: 0,
    engagement: 2.7,
    date: '2026-04-18',
    comments: [
      { user: 'agus.learn', text: 'Me encanto la idea de aprender a preguntar mejor.', sentiment: 'positive' },
      { user: 'leo_docente', text: 'Esto deberia verse en todas las escuelas.', sentiment: 'positive' }
    ]
  },
  {
    id: '8',
    title: 'Pensar es caro, lento y limitado. Por eso, tu mente desarrolló un "piloto automático" fascinante...',
    thumbnail: 'https://picsum.photos/seed/video-8/400/600',
    views: 292851,
    likes: 10332,
    comments_count: 60,
    shares: 0,
    engagement: 3.5,
    date: '2026-04-17',
    comments: [
      { user: 'martu.ops', text: 'A ser puntuales se aprende! Se educa! Eso que decís, para mí, es una manera de justificar al impuntual. Y la puntualidad tiene que ver con el respeto hacia el otro. Es una regla de convivencia. Saludo.', sentiment: 'positive' },
      { user: 'seba.pm', text: 'Gran resumen, corto y accionable.', sentiment: 'positive' }
    ]
  },
  {
    id: '9',
    title: 'Usar IA no te hace más inteligente, sino que te da más opciones. En nuestra región todavía tenemos...',
    thumbnail: 'https://picsum.photos/seed/video-9/400/600',
    views: 120685,
    likes: 3474,
    comments_count: 76,
    shares: 0,
    engagement: 2.9,
    date: '2026-04-16',
    comments: [
      { user: 'clau.startup', text: 'Muy bueno el punto sobre foco y timing.', sentiment: 'positive' },
      { user: 'juan_venture', text: 'Coincido, la distribucion es clave.', sentiment: 'neutral' }
    ]
  },
  {
    id: '10',
    title: 'La tecnología nos prometió acercarnos a los que están lejos, pero el efecto secundario es que nos...',
    thumbnail: 'https://picsum.photos/seed/video-10/400/600',
    views: 213914,
    likes: 5515,
    comments_count: 60,
    shares: 0,
    engagement: 2.6,
    date: '2026-04-14',
    comments: [
      { user: 'mina.career', text: 'Super util para orientar a estudiantes.', sentiment: 'positive' },
      { user: 'tomi.rh', text: 'Se agradece la mirada de largo plazo.', sentiment: 'positive' }
    ]
  },
  {
    id: '11',
    title: 'Hoy hay gente reemplazando el caos de los vínculos reales por parejas diseñadas por app a su medida...',
    thumbnail: 'https://picsum.photos/seed/video-11/400/600',
    views: 104406,
    likes: 1231,
    comments_count: 70,
    shares: 0,
    engagement: 1.2,
    date: '2026-04-13',
    comments: [
      { user: 'santi.media', text: 'El marco de verificacion esta excelente.', sentiment: 'positive' },
      { user: 'pau.news', text: 'Muy necesario este tema.', sentiment: 'positive' }
    ]
  },
  {
    id: '12',
    title: 'El umbral del dolor es tan personal como la huella digital. A algunos una pavada los tumba y otros...',
    thumbnail: 'https://picsum.photos/seed/video-12/400/600',
    views: 93686,
    likes: 1560,
    comments_count: 53,
    shares: 0,
    engagement: 1.7,
    date: '2026-04-12',
    comments: [
      { user: 'gabi.lead', text: 'Gran cierre, equilibrio entre criterio y automatizacion.', sentiment: 'positive' },
      { user: 'flor.people', text: 'Me llevo varias ideas para mi equipo.', sentiment: 'positive' }
    ]
  }
];

const VIDEOS = MOCK_VIDEOS.map((video) => ({
  ...video,
  fallbackThumbnail: video.thumbnail,
  thumbnail: csvThumbnailByStats.get(buildVideoKey(video)) ?? video.thumbnail
}));

const ACCOUNT_STATS = {
  total_followers: 1122856,
  follower_growth: 13000,
  avg_engagement: 5.7,
  total_posts: 1387,
  posts_this_month: 12,
  viral_threshold: 400000
};

// --- COMPONENTS ---

const useCountUp = (target: number, duration = 1400, decimals = 0) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let animationFrameId = 0;
    let startTime = 0;

    const step = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = target * easedProgress;

      setValue(nextValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return Number(value.toFixed(decimals));
};

const AnimatedTotal = ({
  value,
  decimals = 0,
  suffix = ''
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) => {
  const animatedValue = useCountUp(value, 1400, decimals);

  const formattedValue = decimals > 0
    ? animatedValue.toLocaleString('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    : Math.round(animatedValue).toLocaleString('es-AR');

  return <>{formattedValue}{suffix}</>;
};

const StatCard = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);

const VideoRow = ({ video }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card mb-4 transition-all hover:shadow-md">
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-14 h-20 object-cover rounded shadow-sm"
          onError={(event) => {
            if (event.currentTarget.src !== video.fallbackThumbnail) {
              event.currentTarget.src = video.fallbackThumbnail;
            }
          }}
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-base md:text-lg font-bold text-slate-800 truncate">{video.title}</h4>
          <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5 mt-1">
            <Calendar className="w-4 h-4" /> {video.date}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
            <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-500">
              <Play className="w-4 h-4" /> {video.views.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-500">
              <Heart className="w-4 h-4 text-insta-pink" /> {video.likes.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-500">
              <MessageCircle className="w-4 h-4 text-sky-500" /> {video.comments_count}
            </div>
          </div>
        </div>
        <div className="text-right px-2 md:px-4 flex-shrink-0">
          <p className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">Eng.</p>
          <p className="text-base md:text-lg font-bold text-insta-pink">{video.engagement}%</p>
        </div>
        <button className="p-1.5 md:p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-300 flex-shrink-0">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/30 p-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Comentarios
                </h5>
                <div className="space-y-2">
                  {video.comments.map((comment, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <p className="text-[10px] font-bold text-slate-900">@{comment.user}</p>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> Insights
                </h5>
                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] grow flex items-center justify-center text-center">
                  <p className="text-[10px] font-medium text-slate-400 italic">Análisis de rendimiento por hora en curso...</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- TABS ---

const SummaryTab = () => {
  const chartData = useMemo(() => VIDEOS.map(v => ({
    name: v.title,
    views: v.views,
    engagement: v.engagement,
    size: v.likes / 100
  })), []);

  const totals = useMemo(() => ({
    views: VIDEOS.reduce((acc, v) => acc + v.views, 0),
    likes: VIDEOS.reduce((acc, v) => acc + v.likes, 0),
    comments: VIDEOS.reduce((acc, v) => acc + v.comments_count, 0)
  }), []);

  const topVideos = [...VIDEOS].sort((a, b) => b.views - a.views).slice(0, 3);

  const topLikedComments = useMemo(() => (
    VIDEOS
      .flatMap(video => video.comments.map((comment, index) => {
        const baseLikes = video.likes / Math.max(video.comments_count, 1);
        const boost = Math.max(0.7, 1.18 - (index * 0.12));

        return {
          ...comment,
          videoId: video.id,
          likes: baseLikes / 52.8
        };
      }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3)
  ), []);

  const feedbackInsights = useMemo(() => ([
    {
      title: 'Qué no les gustó',
      toneClass: 'amber',
      points: [
        'Algunos reels se perciben demasiado conceptuales y con poca bajada práctica.',
        'Parte de la audiencia sintió que faltó contraste con casos que hayan fracasado.',
        'Varios comentarios marcan que no estan deacuerdo con lo que planteas.'
      ],
      comments: [
        'Buenísimo el análisis, pero me faltó un ejemplo real paso a paso.',
        'Comparto la mirada, aunque estuvo muy macro y poco aterrizado al día a día.'
      ]
    },
    {
      title: 'Temas que piden',
      toneClass: 'sky',
      points: [
        'Cómo implementar IA en pymes sin equipos técnicos grandes.',
        'Guías concretas para docentes y familias sobre uso responsable de IA.',
        'Herramientas recomendadas por caso de uso: productividad, estudio y trabajo.'
      ],
      comments: [
        '¿Podés hacer uno sobre IA en escuelas con ejemplos de aula?',
        'Me encantaría una serie corta tipo checklist para aplicar esto en equipos chicos.'
      ]
    },
    {
      title: 'Dónde quedaron disconformes',
      toneClass: 'rose',
      points: [
        'Quedó la sensación de que el impacto laboral fue planteado sin hoja de ruta concreta.',
        'Algunos usuarios esperaban más profundidad sobre sesgos, privacidad y regulación.',
        'Parte de la comunidad pidió distinguir mejor entre hype y evidencia comprobable.'
      ],
      comments: [
        'Me gustó, pero me fui con más preguntas que respuestas sobre privacidad.',
        'Faltó diferenciar qué ya funciona hoy y qué todavía es promesa.'
      ]
    }
  ]), []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="flex flex-col lg:flex-row gap-6 lg:h-full"
    >
      <div className="flex-grow flex flex-col gap-6">
        {/* Scatter Chart */}
        <div className="card p-6 flex flex-col flex-grow relative overflow-hidden min-h-[520px] lg:min-h-[620px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Views vs. Engagement Rate</h2>
              <p className="text-sm text-slate-500">Correlación del rendimiento mensual de Reels</p>
            </div>
          </div>
          <div className="flex-grow relative border-l border-b border-slate-100 m-4 mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 28, right: 34, bottom: 42, left: 28 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={true} stroke="#cbd5e1" />
                <XAxis 
                  type="number" 
                  dataKey="views" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 13 }}
                  label={{ value: 'Vistas', position: 'insideBottom', offset: -12, fill: '#64748b', fontSize: 14 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="engagement" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 13 }}
                  label={{ value: 'Engagement (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 14, dx: -12 }}
                />
                <ZAxis type="number" dataKey="size" range={[120, 560]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '14px', padding: '10px 12px' }}
                />
                <Scatter name="Videos" data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} className="bubble" fill="url(#insta-gradient-fill)" />
                  ))}
                  <defs>
                    <linearGradient id="insta-gradient-fill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comment Analysis Card */}
        <div className="card p-5 flex-shrink-0">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Análisis de Comentarios</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase mb-2">Temas Destacados</p>
                <div className="flex flex-wrap gap-2">
                  {['ia', 'futuro', 'educacion', 'tecnologia'].map(tag => (
                    <span key={tag} className="bg-white px-2 py-0.5 rounded text-xs border border-blue-200 text-blue-700 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase mb-2">Sentimiento General</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '79%' }}></div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">79% Positivo</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-tight">Resumen IA</p>
              <p className="text-xs font-medium text-slate-500 italic leading-relaxed">
                "La audiencia responde mejor a contenidos de futuro e IA aplicados al trabajo y la educacion. Hay muchar personas disconformes cuando se habla de política, aparecen algunos comentarios negativos. En general la audiencia se siente dolida por los temas a tratar y sienten que hace falta un cambio."
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {feedbackInsights.map((block) => (
                <div
                  key={block.title}
                  className={`p-3 rounded-lg border ${
                    block.toneClass === 'amber'
                      ? 'bg-amber-50 border-amber-100'
                      : block.toneClass === 'sky'
                        ? 'bg-sky-50 border-sky-100'
                        : 'bg-rose-50 border-rose-100'
                  }`}
                >
                  <p className={`text-xs font-bold uppercase mb-2 tracking-tight ${
                    block.toneClass === 'amber'
                      ? 'text-amber-700'
                      : block.toneClass === 'sky'
                        ? 'text-sky-700'
                        : 'text-rose-700'
                  }`}>
                    {block.title}
                  </p>
                  <ul className="space-y-1.5 mb-3">
                    {block.points.map((point) => (
                      <li key={point} className="text-xs text-slate-600 leading-relaxed">• {point}</li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-200/70">
                    <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Comentarios</p>
                    <div className="space-y-1.5">
                      {block.comments.map((comment) => (
                        <p key={comment} className="text-xs text-slate-600 italic leading-relaxed">"{comment}"</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-bold text-blue-700 uppercase mb-2 tracking-tight">Comentarios más likeados</p>
              <div className="space-y-2">
                {topLikedComments.map((comment) => (
                  <div key={`${comment.videoId}-${comment.user}-${comment.text}`} className="bg-white p-3 rounded-lg border border-rose-100">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-slate-800">@{comment.user}</p>
                      <p className="text-xs font-bold text-rose-600 flex items-center gap-1 whitespace-nowrap">
                        <Heart className="w-3 h-3" />
                        {comment.likes.toLocaleString()} likes
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
        {/* Totals Table */}
        <div className="card p-5 flex-shrink-0">
          <h2 className="text-lg font-bold mb-4">Métricas Totales</h2>
          <div className="space-y-4">
            <StatCard label="Videos" value={<AnimatedTotal value={VIDEOS.length} />} />
            <StatCard label="Vistas" value={<AnimatedTotal value={totals.views} />} />
            <StatCard label="Likes" value={<AnimatedTotal value={totals.likes} />} />
            <StatCard label="Comentarios" value={<AnimatedTotal value={totals.comments} />} />
            <StatCard label="Engagement Medio" value={<AnimatedTotal value={ACCOUNT_STATS.avg_engagement} decimals={1} suffix="%" />} />
          </div>
        </div>

        {/* Top Videos Grid */}
        <div className="card p-6 flex-grow flex flex-col min-h-[500px]">
          <h2 className="text-lg font-bold mb-4">Top Videos</h2>
          <div className="grid grid-cols-1 gap-4 pr-2 min-h-0">
            {topVideos.map((v) => (
              <div key={v.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 bg-slate-300 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={v.thumbnail}
                    alt=""
                    className="w-full h-full object-cover opacity-80"
                    onError={(event) => {
                      if (event.currentTarget.src !== v.fallbackThumbnail) {
                        event.currentTarget.src = v.fallbackThumbnail;
                      }
                    }}
                    referrerPolicy="no-referrer"
                  />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-snug text-slate-800 line-clamp-3">{v.title}</p>
                    <p className="text-sm text-rose-500 font-bold mt-2">{v.engagement}% Eng.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VideosTab = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Desglose de Videos</h1>
          <p className="text-xs text-slate-500 mt-1">Estadísticas detalladas de cada publicación</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider outline-none focus:ring-1 focus:ring-insta-pink/20">
            <option>Más recientes</option>
            <option>Más vistos</option>
            <option>Mayor engagement</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-3">
        {VIDEOS.map(video => (
          <VideoRow key={video.id} video={video} />
        ))}
      </div>
    </motion.div>
  );
};

const AccountTab = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Account Header */}
      <div className="card p-8 flex flex-col md:flex-row gap-8 items-center bg-white">
        <div className="relative">
          <div className="w-24 h-24 rounded-full p-0.5 instagram-gradient shadow-lg">
            <img 
              src="/public/profile.jpg" 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover ring-2 ring-white"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">@s.bilinkis</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">🤓 Investigo y reflexionamos. Educacion, tecnologia y mas. Creador Digital - Futuro en Construccion</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-6">
            <div className="border-r border-slate-100 pr-8">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Followers</p>
              <p className="text-xl font-bold text-slate-900">{ACCOUNT_STATS.total_followers.toLocaleString()}</p>
            </div>
            <div className="border-r border-slate-100 pr-8">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Eng.</p>
              <p className="text-xl font-bold text-insta-pink">{ACCOUNT_STATS.avg_engagement}%</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Posts</p>
              <p className="text-xl font-bold text-slate-900">{ACCOUNT_STATS.total_posts}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <button className="px-6 py-2 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">
            Download Report
          </button>
          <button className="px-6 py-2 bg-white text-slate-900 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
            Share Stats
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Viral Highlights */}
        <div className="card p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-insta-orange" /> Viral Peak Performance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VIDEOS.filter(v => v.views > ACCOUNT_STATS.viral_threshold).map(v => (
              <div key={v.id} className="group relative rounded-lg overflow-hidden aspect-[4/5] shadow-sm border border-slate-100">
                <img
                  src={v.thumbnail}
                  alt=""
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                  onError={(event) => {
                    if (event.currentTarget.src !== v.fallbackThumbnail) {
                      event.currentTarget.src = v.fallbackThumbnail;
                    }
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-2 px-3">
                  <p className="text-[9px] text-white font-bold truncate mb-1">{v.views.toLocaleString()} vistas</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Insights */}
        <div className="card p-6 bg-slate-900 text-white">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users className="w-3 h-3 text-sky-400" /> Audience Insights (AI)
          </h3>
          <div className="space-y-5">
            <div className="bg-white/5 p-4 rounded border border-white/5 italic">
              <p className="text-xs text-gray-500 leading-relaxed">
                "@s.bilinkis consolida picos de retencion cuando conecta IA con decisiones concretas de trabajo y aprendizaje."
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Growth keywords</p>
              <div className="flex flex-wrap gap-2">
                {['#inteligenciaartificial', '#futuro', '#trabajo', '#aprendizaje'].map(phrase => (
                  <span key={phrase} className="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-400 lowercase font-medium">
                    {phrase}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Community Health</span>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest italic">Stable</span>
              </div>
              <div className="bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'summary' | 'videos' | 'account'>('summary');

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 font-sans">
      {/* Header */}
      <header className="min-h-24 bg-white border-b border-slate-200 px-6 md:px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-insta-pink/20 border border-slate-100 bg-white">
            <img
              src="/favicon.svg"
              alt="InstaGraph logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">InstaStats</h1>
            <p className="text-xs font-medium text-slate-400 mt-1.5">Reporte Mensual | @s.bilinkis</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="bg-slate-100 px-4 py-2 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wider border border-slate-200">
            Abril 2026
          </div>
          <div className="w-11 h-11 rounded-full border border-slate-200 overflow-hidden ring-2 ring-white shadow-sm">
            <img src="/public/profile.jpg" alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 flex px-6 flex-shrink-0 space-x-2">
        {[
          { id: 'summary', label: 'Resumen General' },
          { id: 'videos', label: 'Estadísticas por Video' },
          { id: 'account', label: 'General de la Cuenta' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              px-6 py-4 text-[11px] font-bold transition-all uppercase tracking-widest border-b-2
              ${activeTab === tab.id 
                ? 'border-insta-pink text-insta-pink' 
                : 'border-transparent text-slate-400 hover:text-slate-600'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="p-6 flex-grow overflow-hidden relative">
        <div className="h-full overflow-y-auto custom-scrollbar pr-1">
          <AnimatePresence mode="wait">
            {activeTab === 'summary' && <SummaryTab key="summary" />}
            {activeTab === 'videos' && <VideosTab key="videos" />}
            {activeTab === 'account' && <AccountTab key="account" />}
          </AnimatePresence>
        </div>
      </main>

      {/* Custom scrollbar styles as a one-off in this file if needed, but Tailwind normally handles well */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
