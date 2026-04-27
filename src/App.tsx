/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, type ReactNode } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie, ReferenceLine
} from 'recharts';
import { 
  Instagram, Users, Play, Heart, MessageCircle, Share2, 
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
const ALL_CHANNEL_VIDEOS = (() => {
  const rows = parseCsv(reelsCsvRaw);

  return rows
    .map((row, index) => {
      const views = Number(row.play_count || row.view_count || 0);
      const likes = Number(row.like_count || 0);
      const comments_count = Number(row.comment_count || 0);
      const title = (row.caption_text || `Video ${index + 1}`).trim();
      const date = row.publication_date?.slice(0, 10) || '';
      const engagement = views > 0 ? ((likes + comments_count) / views) * 100 : 0;

      return {
        id: row.media_id || String(index + 1),
        title,
        views,
        likes,
        comments_count,
        engagement,
        date
      };
    })
    .filter((video) => video.views > 0 || video.likes > 0 || video.comments_count > 0);
})();

const ACCOUNT_STATS = {
  total_followers: 1122856,
  follower_growth: 13000,
  avg_engagement: 5.7,
  total_posts: 1387,
  posts_this_month: 12,
  viral_threshold: 400000
};

const profileImageUrl = `${import.meta.env.BASE_URL}profile.jpg`;
const faviconUrl = `${import.meta.env.BASE_URL}favicon.svg`;

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

const buildWeightedDistribution = (
  total: number,
  segments: Array<{ name: string; weight: number; color: string }>
) => {
  if (total <= 0) {
    return segments.map((segment) => ({ ...segment, value: 0 }));
  }

  const weightSum = segments.reduce((acc, segment) => acc + segment.weight, 0);
  const provisional = segments.map((segment) => {
    const exact = (segment.weight / weightSum) * total;
    const base = Math.floor(exact);

    return {
      ...segment,
      base,
      fraction: exact - base
    };
  });

  let remaining = total - provisional.reduce((acc, segment) => acc + segment.base, 0);

  provisional
    .sort((a, b) => b.fraction - a.fraction)
    .forEach((segment) => {
      if (remaining > 0) {
        segment.base += 1;
        remaining -= 1;
      }
    });

  return provisional.map(({ name, color, base }) => ({ name, color, value: base }));
};

const generateOpinionSummaries = (video: any) => {
  const title = video.title.toLowerCase();

  let positiveSummary = 'La audiencia valoró la claridad con que se abordó una experiencia muy común.';
  let negativeSummary = 'Algunos no vivieron esa experiencia específica y sintieron que no se aplicaba a su contexto.';

  if (title.includes('padre') || title.includes('paternidad')) {
    positiveSummary = 'Les gustó que hayas tocado una experiencia tan común pero tan profunda: ser padre te da algo diferente. Muchos se sintieron representados.';
    negativeSummary = 'Algunos usuarios sin hijos comentaron que no podían relacionarse con la reflexión o pidieron una visión más universal.';
  } else if (title.includes('obediencia') || title.includes('obedecer')) {
    positiveSummary = 'Valoraron que expongas un comportamiento automático que experimentan en sus vidas cotidianas sin darse cuenta. Se sintieron identificados al reconocer patrones propios.';
    negativeSummary = 'Algunos cuestionaron si el experimento en el que basas la reflexión realmente aplica en contextos actuales o si exageraba la conclusión.';
  } else if (title.includes('identidad') || title.includes('propósito')) {
    positiveSummary = 'Resonó profundamente cómo describes la búsqueda de identidad como algo que todos viven. Muchos agradecieron el reflejo de su propia confusión.';
    negativeSummary = 'Algunos sintieron que tu reflexión no capturaba su realidad específica o que las herramientas sugeridas no aplicaban a sus circunstancias.';
  } else if (title.includes('claude') || title.includes('ia') || title.includes('tecnología')) {
    positiveSummary = 'Apreciaron que muestres cómo esta tecnología resuelve problemas reales y cotidianos, no solo especulación teórica.';
    negativeSummary = 'Algunos sintieron que no abordaste los límites éticos o que el optimismo no reflejaba los riesgos que ya experimentan en sus roles.';
  } else if (title.includes('crítico') || title.includes('autocrítica')) {
    positiveSummary = 'Muchos se identificaron con ese "crítico interno" que describes. Les gustó reconocer algo que viven pero no habían podido nombrar claramente.';
    negativeSummary = 'Algunos sintieron que tu experiencia sobre la autocrítica era muy personal y no la compartían, o que las estrategias propuestas no funcionaban para ellos.';
  } else if (title.includes('silencio') || title.includes('ruido')) {
    positiveSummary = 'Validó una experiencia muy común pero poco hablada: que algunos necesitan silencio y otros caos para rendir. Se sintieron finalmente entendidos.';
    negativeSummary = 'Algunos comentaron que esto es demasiado simplista o que sus necesidades cognitivas no encajaban en tu dicotomía propuesta.';
  } else if (title.includes('seguridad') || title.includes('confianza')) {
    positiveSummary = 'Les gustó que hayas sacado a la luz cómo la gente habla con seguridad sin saber realmente. Muchos reconocieron comportamientos propios.';
    negativeSummary = 'Algunos no estuvieron de acuerdo con tus ejemplos específicos o sintieron que no reflejaba su realidad profesional.';
  } else if (title.includes('automatico') || title.includes('pensamiento')) {
    positiveSummary = 'Apreciaron que expliques por qué nuestro cerebro funciona así. Se sintieron validados al entender sus propios atajos mentales automáticos.';
    negativeSummary = 'Algunos sintieron que la simplificación no capturaba la complejidad de cómo realmente funciona su pensamiento.';
  }

  return { positiveSummary, negativeSummary };
};

const buildVideoCommentCharts = (video: any) => {
  const seed = Number(video.id) || 1;
  const totalComments = Math.max(video.comments_count || 0, 0);
  const commentsViewsRatio = video.views > 0 ? totalComments / video.views : 0;

  const longCommentsRate = 0.22 + ((seed * 11) % 24) / 100;
  const longComments = Math.max(0, Math.round(totalComments * longCommentsRate));
  const shortComments = Math.max(0, totalComments - longComments);

  const commentTypes = buildWeightedDistribution(totalComments, [
    { name: 'Humor', weight: 12 + (seed % 4), color: '#f59e0b' },
    { name: 'Anécdota', weight: 18 + ((seed * 2) % 5), color: '#0ea5e9' },
    { name: 'Opinión', weight: 20 + ((seed * 3) % 6), color: '#6366f1' },
    { name: 'Spa', weight: 8 + ((seed * 4) % 4), color: '#ef4444' },
    { name: 'Petición', weight: 16 + ((seed * 5) % 5), color: '#10b981' },
    { name: 'Arroba', weight: 14 + ((seed * 6) % 5), color: '#ec4899' }
  ]);

  const opinionMix = buildWeightedDistribution(totalComments, [
    { name: 'A favor', weight: 46 + (seed % 6), color: '#10b981' },
    { name: 'En contra', weight: 22 + ((seed * 2) % 6), color: '#ef4444' },
    { name: 'Neutras', weight: 32 + ((seed * 3) % 6), color: '#64748b' }
  ]);

  const positiveCount = opinionMix.find((entry) => entry.name === 'A favor')?.value ?? 0;
  const neutralCount = opinionMix.find((entry) => entry.name === 'Neutras')?.value ?? 0;

  const againstCount = opinionMix.find((entry) => entry.name === 'En contra')?.value ?? 0;
  const aggressiveAgainst = Math.round(againstCount * (0.34 + ((seed * 7) % 21) / 100));
  const calmAgainst = Math.max(0, againstCount - aggressiveAgainst);

  const againstTone = {
    aggressive: aggressiveAgainst,
    calm: calmAgainst,
    total: againstCount,
    aggressivenessIndex: againstCount > 0 ? (aggressiveAgainst / againstCount) * 100 : 0
  };

  const { positiveSummary, negativeSummary } = generateOpinionSummaries(video);

  return {
    totalComments,
    commentsViewsRatio,
    lengthBreakdown: {
      shortComments,
      longComments
    },
    commentTypes,
    opinionMix,
    againstTone,
    positiveSummary,
    negativeSummary,
    neutralCount
  };
};

// --- CATEGORIZACIÓN DE VIDEOS ---

const categorizeVideo = (video: any): string => {
  const title = video.title.toLowerCase();
  if (
    title.includes('ia') ||
    title.includes('claude') ||
    title.includes('inteligencia artificial') ||
    title.includes('chatgpt') ||
    title.includes('modelo')
  ) {
    return 'Inteligencia Artificial';
  }

  if (
    title.includes('padre') ||
    title.includes('crianza') ||
    title.includes('hijo') ||
    title.includes('hija') ||
    title.includes('familia')
  ) {
    return 'Crianza';
  }

  if (
    title.includes('neurociencia') ||
    title.includes('cerebro') ||
    title.includes('hábito') ||
    title.includes('habito') ||
    title.includes('psicolog') ||
    title.includes('conducta') ||
    title.includes('silencio') ||
    title.includes('crítico') ||
    title.includes('critico')
  ) {
    return 'Neurociencia y Hábitos';
  }

  if (
    title.includes('identidad') ||
    title.includes('propósito') ||
    title.includes('proposito') ||
    title.includes('vocación') ||
    title.includes('vocacion') ||
    title.includes('carrera') ||
    title.includes('aprendizaje') ||
    title.includes('aprender') ||
    title.includes('educa')
  ) {
    return 'Aprendizaje';
  }

  if (
    title.includes('emprende') ||
    title.includes('negocio') ||
    title.includes('startup') ||
    title.includes('empresa') ||
    title.includes('ventas')
  ) {
    return 'Emprendedurismo';
  }

  if (
    title.includes('sociedad') ||
    title.includes('social') ||
    title.includes('innovación') ||
    title.includes('innovacion') ||
    title.includes('relación') ||
    title.includes('relacion') ||
    title.includes('vínculos') ||
    title.includes('vinculos') ||
    title.includes('tecnología') ||
    title.includes('tecnologia')
  ) {
    return 'Innovación y Sociedad';
  }

  return 'Innovación y Sociedad';
};

const VIDEO_CATEGORIES = {
  'Emprendedurismo': '#f59e0b',
  'Neurociencia y Hábitos': '#ec4899',
  'Aprendizaje': '#0ea5e9',
  'Inteligencia Artificial': '#8b5cf6',
  'Crianza': '#10b981',
  'Innovación y Sociedad': '#6366f1'
};

const buildCategoryChartData = (sourceVideos: Array<{ title: string; views: number; likes: number; engagement: number }>) => {
  const categorizedVideos = sourceVideos.map(video => ({
    ...video,
    category: categorizeVideo(video)
  }));

  const categoryStats = Object.keys(VIDEO_CATEGORIES).map(category => {
    const videos = categorizedVideos.filter(v => v.category === category);
    if (videos.length === 0) return null;

    const totalViews = videos.reduce((acc, v) => acc + v.views, 0);
    const totalLikes = videos.reduce((acc, v) => acc + v.likes, 0);
    const avgEngagement = videos.reduce((acc, v) => acc + v.engagement, 0) / videos.length;

    return {
      name: category,
      views: totalViews,
      engagement: parseFloat(avgEngagement.toFixed(1)),
      size: totalLikes / 100,
      color: VIDEO_CATEGORIES[category as keyof typeof VIDEO_CATEGORIES]
    };
  }).filter((item): item is Exclude<typeof item, null> => item !== null);

  return categoryStats;
};

const MONTHLY_CATEGORY_CHART_DATA = buildCategoryChartData(VIDEOS);
const CHANNEL_CATEGORY_CHART_DATA = buildCategoryChartData(ALL_CHANNEL_VIDEOS);
const ACCOUNT_CATEGORY_CHART_MOCK = [
  { name: 'Emprendedurismo', views: 1320000, engagement: 5.2, size: 460, color: VIDEO_CATEGORIES['Emprendedurismo'] },
  { name: 'Neurociencia y Hábitos', views: 2840000, engagement: 6.7, size: 690, color: VIDEO_CATEGORIES['Neurociencia y Hábitos'] },
  { name: 'Aprendizaje', views: 1910000, engagement: 4.8, size: 520, color: VIDEO_CATEGORIES['Aprendizaje'] },
  { name: 'Inteligencia Artificial', views: 2480000, engagement: 6.1, size: 620, color: VIDEO_CATEGORIES['Inteligencia Artificial'] },
  { name: 'Crianza', views: 3010000, engagement: 5.0, size: 560, color: VIDEO_CATEGORIES['Crianza'] },
  { name: 'Innovación y Sociedad', views: 2260000, engagement: 4.3, size: 500, color: VIDEO_CATEGORIES['Innovación y Sociedad'] }
];
const MacroTopicBubble = (props: any) => {
  const { cx, cy, payload } = props;
  const radius = Math.max(14, Math.min(28, (payload?.size ?? 300) / 22));

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={payload?.color ?? '#6366f1'}
        fillOpacity={0.9}
        stroke="#ffffff"
        strokeWidth={2}
      />
    </g>
  );
};

const VIDEO_COMMENT_CHARTS = VIDEOS.map((video) => ({
  id: video.id,
  charts: buildVideoCommentCharts(video)
}));

const COMMENT_CHARTS_AVERAGES = (() => {
  const totalVideos = Math.max(VIDEO_COMMENT_CHARTS.length, 1);
  const firstCharts = VIDEO_COMMENT_CHARTS[0]?.charts;

  const baseCommentTypes = firstCharts?.commentTypes.map((entry: any) => ({
    name: entry.name,
    color: entry.color,
    value: 0
  })) ?? [];

  const baseOpinionMix = firstCharts?.opinionMix.map((entry: any) => ({
    name: entry.name,
    color: entry.color,
    value: 0
  })) ?? [];

  const totals = VIDEO_COMMENT_CHARTS.reduce((acc, item) => {
    const { charts } = item;

    acc.totalComments += charts.totalComments;
    acc.commentsViewsRatio += charts.commentsViewsRatio;
    acc.shortComments += charts.lengthBreakdown.shortComments;
    acc.longComments += charts.lengthBreakdown.longComments;
    acc.aggressive += charts.againstTone.aggressive;
    acc.calm += charts.againstTone.calm;
    acc.aggressivenessIndex += charts.againstTone.aggressivenessIndex;

    charts.commentTypes.forEach((entry: any, index: number) => {
      acc.commentTypes[index].value += entry.value;
    });

    charts.opinionMix.forEach((entry: any, index: number) => {
      acc.opinionMix[index].value += entry.value;
    });

    return acc;
  }, {
    totalComments: 0,
    commentsViewsRatio: 0,
    shortComments: 0,
    longComments: 0,
    aggressive: 0,
    calm: 0,
    aggressivenessIndex: 0,
    commentTypes: baseCommentTypes,
    opinionMix: baseOpinionMix
  });

  return {
    totalComments: totals.totalComments / totalVideos,
    commentsViewsRatio: totals.commentsViewsRatio / totalVideos,
    lengthBreakdown: {
      shortComments: totals.shortComments / totalVideos,
      longComments: totals.longComments / totalVideos
    },
    commentTypes: totals.commentTypes.map((entry: any) => ({
      ...entry,
      value: entry.value / totalVideos
    })),
    opinionMix: totals.opinionMix.map((entry: any) => ({
      ...entry,
      value: entry.value / totalVideos
    })),
    againstTone: {
      aggressive: totals.aggressive / totalVideos,
      calm: totals.calm / totalVideos,
      aggressivenessIndex: totals.aggressivenessIndex / totalVideos
    }
  };
})();

const VideoRow = ({ video, isTarget = false }: { video: any; isTarget?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const charts = useMemo(() => buildVideoCommentCharts(video), [video]);
  const averages = COMMENT_CHARTS_AVERAGES;
  const averageShortRatio = averages.totalComments > 0
    ? averages.lengthBreakdown.shortComments / averages.totalComments
    : 0;
  const averageCutPosition = Math.max(charts.totalComments, 1) * averageShortRatio;

  return (
    <motion.div
      layout
      animate={isExpanded ? { width: '106%', x: '-3%' } : { width: '100%', x: '0%' }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`card mb-4 transition-all hover:shadow-md ${isTarget ? 'ring-2 ring-insta-pink/50 shadow-md' : ''}`}
    >
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
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ duration: 0.22, delay: 0.15 }}
            className="border-t border-slate-100 bg-slate-50/30 p-5"
          >
            <div className="flex flex-col gap-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" /> Gráficos de comentarios
                </h5>
                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de comentarios</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">{charts.totalComments.toLocaleString()}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Promedio: {Math.round(averages.totalComments).toLocaleString('es-AR')}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                      <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Índice comentarios / views</p>
                      <p className="text-xl font-bold text-indigo-700 mt-1">{(charts.commentsViewsRatio * 100).toFixed(2)}</p>
                      <p className="text-[11px] text-indigo-700/80 mt-1">Promedio índice: {(averages.commentsViewsRatio * 100).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Proporción de comentarios largos y cortos</p>
                    <div className="w-full h-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              label: 'Video',
                              Cortos: charts.lengthBreakdown.shortComments,
                              Largos: charts.lengthBreakdown.longComments
                            },
                          ]}
                          layout="vertical"
                            barSize={10}
                          margin={{ top: 8, right: 0, bottom: 8, left: 0 }}
                        >
                          <XAxis type="number" hide domain={[0, Math.max(charts.totalComments, 1)]} />
                          <YAxis type="category" dataKey="label" hide />
                          <Tooltip formatter={(value: number) => value.toLocaleString('es-AR')} />
                            <Bar dataKey="Cortos" stackId="comments-length" fill="#38bdf8" radius={[999, 0, 0, 999]} />
                            <Bar dataKey="Largos" stackId="comments-length" fill="#f97316" radius={[0, 999, 999, 0]} />
                            <ReferenceLine
                              x={averageCutPosition}
                              stroke="#475569"
                              strokeDasharray="4 4"
                              strokeWidth={2}
                            />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <p className="text-xs font-medium text-sky-600">Cortos: {charts.lengthBreakdown.shortComments.toLocaleString()}</p>
                      <p className="text-xs font-medium text-orange-600">Largos: {charts.lengthBreakdown.longComments.toLocaleString()}</p>
                      <p className="text-xs font-medium text-slate-600">Media de proporción (corte): {(averageShortRatio * 100).toFixed(1)}% cortos</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                      <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-2">Tipos de comentarios</p>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={charts.commentTypes}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={112}
                              innerRadius={58}
                            >
                              {charts.commentTypes.map((entry: any) => (
                                <Cell key={`comment-type-${entry.name}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => value.toLocaleString('es-AR')} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                        {charts.commentTypes.map((entry: any) => (
                          <p key={entry.name} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_11rem] gap-3">
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">Opiniones</p>
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.opinionMix} margin={{ top: 8, right: 6, bottom: 18, left: 0 }}>
                              <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                              />
                              <YAxis hide domain={[0, 'dataMax + 5']} />
                              <Tooltip formatter={(value: number) => value.toLocaleString('es-AR')} />
                              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {charts.opinionMix.map((entry: any) => (
                                  <Cell key={`opinion-${entry.name}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2">
                          {charts.opinionMix.map((entry: any) => (
                            <p key={entry.name} className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                              {entry.name}: {entry.value}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-slate-200 text-slate-800 flex flex-col items-center justify-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">Termómetro negativo</p>
                        <div className="h-44 w-10 rounded-full bg-slate-100 border border-slate-200 relative overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-400 via-amber-400 to-rose-500"
                            style={{ height: `${charts.againstTone.aggressivenessIndex.toFixed(1)}%` }}
                          ></div>
                          <div
                            className="absolute left-0 right-0 border-t border-slate-700/70"
                            style={{ bottom: `${averages.againstTone.aggressivenessIndex.toFixed(1)}%` }}
                            title={`Promedio ${averages.againstTone.aggressivenessIndex.toFixed(1)}%`}
                          ></div>
                        </div>
                        <p className="text-xs font-bold mt-2 text-rose-600">{charts.againstTone.aggressivenessIndex.toFixed(1)}% agresivas</p>
                        <p className="text-[10px] text-slate-500 mt-1 text-center">Suele ser: {averages.againstTone.aggressivenessIndex.toFixed(1)}% agresivas</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-md border border-emerald-100 p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Opiniones positivas</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{charts.positiveSummary}</p>
                      </div>
                      <div className="bg-rose-50 rounded-md border border-rose-100 p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-1">Opiniones negativas</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{charts.negativeSummary}</p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- TABS ---

const SummaryTab = ({ onVideoSelect }: { onVideoSelect: (videoId: string) => void }) => {
  const chartData = useMemo(() => VIDEOS.map(v => ({
    id: v.id,
    name: v.title,
    shortLabel: v.title.length > 22 ? `${v.title.slice(0, 22)}...` : v.title,
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
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
                  formatter={(value: number, key: string) => {
                    if (key === 'views') {
                      return [Number(value).toLocaleString('es-AR'), 'Vistas'];
                    }
                    if (key === 'engagement') {
                      return [`${Number(value).toFixed(1)}%`, 'Engagement'];
                    }
                    return [value, key];
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '14px', padding: '10px 12px' }}
                />
                <Scatter
                  name="Videos"
                  data={chartData}
                  onClick={(point: any) => {
                    const clickedId = point?.id ?? point?.payload?.id;
                    if (clickedId) {
                      onVideoSelect(String(clickedId));
                    }
                  }}
                  activeDot={{ r: 10 }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} className="bubble cursor-pointer" fill="url(#insta-gradient-fill)" />
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

        {/* Desempeño por Tema Macro */}
        <div className="card p-6 flex flex-col flex-grow relative overflow-hidden min-h-[560px] lg:min-h-[700px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Desempeño por Tema Macro</h2>
              <p className="text-sm text-slate-500">Distribución mensual de videos por categoría temática</p>
            </div>
          </div>
          <div className="flex-grow relative border-l border-b border-slate-100 m-2 mt-4 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 36, right: 46, bottom: 52, left: 40 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={true} stroke="#cbd5e1" />
                <XAxis 
                  type="number" 
                  dataKey="views" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 14 }}
                  label={{ value: 'Vistas', position: 'insideBottom', offset: -12, fill: '#64748b', fontSize: 14 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="engagement" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 14 }}
                  label={{ value: 'Engagement (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 14, dx: -12 }}
                />
                <ZAxis type="number" dataKey="size" range={[140, 700]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '14px', padding: '10px 12px' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <p className="text-sm font-bold text-slate-900">{data.name}</p>
                          <p className="text-xs text-slate-600">Vistas: {(data.views / 1000000).toFixed(1)}M</p>
                          <p className="text-xs text-slate-600">Engagement: {data.engagement}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Categorías" data={MONTHLY_CATEGORY_CHART_DATA}>
                  {MONTHLY_CATEGORY_CHART_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center px-4 pb-2">
            {MONTHLY_CATEGORY_CHART_DATA.map((category) => (
              <div key={category.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-xs font-medium text-slate-600">{category.name}</span>
              </div>
            ))}
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

const VideosTab = ({ targetVideoId }: { targetVideoId: string | null }) => {
  useEffect(() => {
    if (!targetVideoId) {
      return;
    }

    const targetElement = document.querySelector(`[data-video-id="${targetVideoId}"]`) as HTMLElement | null;
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [targetVideoId]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto overflow-x-visible px-5"
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
          <div key={video.id} data-video-id={video.id}>
            <VideoRow video={video} isTarget={targetVideoId === video.id} />
          </div>
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
              src={profileImageUrl}
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

      {/* Desempeño por Tema Macro (Histórico del Canal) */}
      <div className="card p-6 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Desempeño por Tema Macro</h2>
            <p className="text-sm text-slate-500">Histórico completo del canal por categoría temática</p>
          </div>
        </div>
        <div className="relative border-l border-b border-slate-200 m-2 mt-4 mb-8 h-[420px] lg:h-[560px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 36, right: 46, bottom: 52, left: 40 }}>
              <CartesianGrid strokeDasharray="3 4" vertical={true} stroke="#94a3b8" />
              <XAxis
                type="number"
                dataKey="views"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 14 }}
                label={{ value: 'Vistas', position: 'insideBottom', offset: -12, fill: '#64748b', fontSize: 14 }}
              />
              <YAxis
                type="number"
                dataKey="engagement"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 14 }}
                label={{ value: 'Engagement (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 14, dx: -12 }}
              />
              <ZAxis type="number" dataKey="size" range={[140, 700]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '14px', padding: '10px 12px' }}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <p className="text-sm font-bold text-slate-900">{data.name}</p>
                        <p className="text-xs text-slate-600">Vistas: {(data.views / 1000000).toFixed(1)}M</p>
                        <p className="text-xs text-slate-600">Engagement: {data.engagement}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Categorías" data={ACCOUNT_CATEGORY_CHART_MOCK} shape={<MacroTopicBubble />}>
                {ACCOUNT_CATEGORY_CHART_MOCK.map((entry, index) => (
                  <Cell key={`channel-cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 justify-center px-4 pb-2">
          {ACCOUNT_CATEGORY_CHART_MOCK.map((category) => (
            <div key={category.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
              <span className="text-xs font-medium text-slate-600">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'summary' | 'videos' | 'account'>('summary');
  const [targetVideoId, setTargetVideoId] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 font-sans">
      {/* Header */}
      <header className="min-h-24 bg-white border-b border-slate-200 px-6 md:px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-insta-pink/20 border border-slate-100 bg-white">
            <img
              src={faviconUrl}
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
            <img src={profileImageUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id !== 'videos') {
                setTargetVideoId(null);
              }
            }}
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
            {activeTab === 'summary' && (
              <SummaryTab
                onVideoSelect={(videoId) => {
                  setTargetVideoId(videoId);
                  setActiveTab('videos');
                }}
              />
            )}
            {activeTab === 'videos' && <VideosTab targetVideoId={targetVideoId} />}
            {activeTab === 'account' && <AccountTab />}
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
