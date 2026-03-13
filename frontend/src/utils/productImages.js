export function getProductImageUrls(product) {
  if (!product) {
    return [];
  }

  const urls = [];
  const seen = new Set();
  const candidates = [
    product.mainImageUrl,
    ...(product.images || []).map((image) =>
      typeof image === 'string' ? image : image?.imageUrl
    ),
  ];

  candidates.forEach((url) => {
    const normalizedUrl = typeof url === 'string' ? url.trim() : '';
    if (!normalizedUrl || seen.has(normalizedUrl)) {
      return;
    }

    seen.add(normalizedUrl);
    urls.push(normalizedUrl);
  });

  return urls;
}

export function getPrimaryProductImageUrl(product, fallbackSize = '400/500') {
  const [firstImage] = getProductImageUrls(product);
  return firstImage || `https://picsum.photos/seed/${product?.id || 'product'}/${fallbackSize}`;
}
