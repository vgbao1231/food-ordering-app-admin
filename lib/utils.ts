import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import imageCompression from 'browser-image-compression';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function formatVnCurrencyShort(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} tỷ`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')} triệu`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')} nghìn`;
  } else {
    return value.toString();
  }
}

export function convertToEmbedUrl(url: any) {
  try {
    const ytUrl = new URL(url);

    // Lấy videoId từ ?v= trên youtube.com hoặc từ path trên youtu.be
    const videoId = ytUrl.hostname.includes('youtu.be')
      ? ytUrl.pathname.slice(1)
      : ytUrl.searchParams.get('v');

    // Lấy thời gian bắt đầu nếu có (t=94s hoặc t=94)
    const tParam = ytUrl.searchParams.get('t');
    const startTime = tParam ? parseInt(tParam.replace('s', '')) : null;

    if (!videoId) return null;

    // Tạo query string
    const params = new URLSearchParams();
    params.set('autoplay', '1');
    params.set('mute', '1'); // tránh bị chặn bởi trình duyệt
    if (startTime) {
      params.set('start', startTime.toString());
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  } catch (err) {
    return null;
  }
}

export function formatViews(num: number) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export async function compressImage(file: File) {
  const options = {
    maxSizeMB: 1, // target dưới 1MB
    maxWidthOrHeight: 1920, // scale về chiều dài max 1920px
    useWebWorker: true,
  };
  return await imageCompression(file, options);
}

export function diffPayload(newData: any, oldData: any) {
  return Object.fromEntries(
    Object.entries(newData).filter(([key, value]) => value !== oldData?.[key])
  );
}

export function setDeep(obj: any, path: string, value: any) {
  const parts = path.replace(/\]/g, '').split(/\.|\[/);
  let current = obj;
  parts.forEach((part, idx) => {
    if (idx === parts.length - 1) {
      current[part] = value;
    } else {
      if (!(part in current))
        current[part] = /^\d+$/.test(parts[idx + 1]) ? [] : {};
      current = current[part];
    }
  });
}

export const formatPriceRange = (
  priceArray: number[] | null | undefined
): string => {
  if (!priceArray || priceArray.length < 2) return 'Liên hệ';

  const [minPrice, maxPrice] = priceArray;

  const convertAndFormat = (price: number): string => {
    if (price >= 1_000_000_000) {
      const value = (price / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
      return `${value} Tỷ`;
    }
    if (price >= 1_000_000) {
      const value = (price / 1_000_000).toFixed(0);
      return `${value} Triệu`;
    }
    return price.toLocaleString('vi-VN');
  };

  const min = convertAndFormat(minPrice);
  const max = convertAndFormat(maxPrice);

  return min === max ? min : `Từ ${min} - ${max}`;
};

export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('vi-VN');

export const decodeJwtPayload = (token: string | undefined) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Lỗi giải mã JWT:', error);
    return null;
  }
};
