export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { shop_id, order_id, isZero } = body;

    console.log('[update-order-prices] Request:', JSON.stringify(body));

    if (!shop_id || !order_id) {
      return json({ success: false, message: 'Thiếu shop_id hoặc order_id' }, 400);
    }

    const API_KEY = env.POS_API_KEY;
    if (!API_KEY) {
      return json({ success: false, message: 'Chưa cấu hình POS_API_KEY' }, 500);
    }

    // --- Load bảng giá ---
    // Cách 1: static file cùng domain
    const origin = new URL(request.url).origin;
    const priceRes = await fetch(`${origin}/product-prices.json`);
    if (!priceRes.ok) {
      return json({
        success: false,
        message: 'Không đọc được product-prices.json (kiểm tra file đã deploy chưa)'
      }, 500);
    }
    const priceMap = await priceRes.json(); // { product_id: retail_price }
    console.log('[update-order-prices] Price map keys:', Object.keys(priceMap).length);

    // --- GET order ---
    const getUrl = `https://pos.pages.fm/api/v1/shops/${shop_id}/orders/${order_id}?api_key=${API_KEY}`;
    console.log('[update-order-prices] GET order:', getUrl.replace(API_KEY, '***'));

    const getRes = await fetch(getUrl, { headers: { Accept: 'application/json' } });
    const getData = await getRes.json();
    console.log('[update-order-prices] GET status:', getRes.status);

    if (!getRes.ok || getData.success === false) {
      return json({
        success: false,
        message: getData.message || 'GET order thất bại',
        data: getData
      }, getRes.status || 400);
    }

    // Response có thể bọc trong data
    const order = getData.data || getData;
    const items = order.items || [];

    if (!items.length) {
      return json({ success: false, message: 'Đơn không có items' }, 400);
    }

    // --- Map retail_price theo product_id ---
    const missing = [];
    const updatedItems = items.map((item) => {
      const productId = item.product_id;
      const newPrice = isZero ? 0 : priceMap[productId];

      if (newPrice === undefined || newPrice === null) {
        missing.push(productId);
      }

      const variationInfo = {
        ...(item.variation_info || {}),
        retail_price: newPrice !== undefined && newPrice !== null
          ? Number(newPrice)
          : item.variation_info?.retail_price
      };

      // Body PUT items: giữ các field cần thiết
      return {
        id: item.id,
        product_id: item.product_id,
        variation_id: item.variation_id,
        quantity: item.quantity,
        discount_each_product: item.discount_each_product ?? 0,
        is_bonus_product: item.is_bonus_product ?? false,
        is_discount_percent: item.is_discount_percent ?? false,
        is_wholesale: item.is_wholesale ?? false,
        one_time_product: item.one_time_product ?? false,
        note: item.note ?? null,
        note_product: item.note_product ?? '',
        variation_info: variationInfo
      };
    });

    if (missing.length > 0) {
      console.log('[update-order-prices] Missing product_id in price map:', missing);
      // Vẫn cho update các sp có trong map; báo warning
    }

    const updateBody = { items: updatedItems };

    console.log('[update-order-prices] PUT body items count:', updatedItems.length);

    const putUrl = `https://pos.pages.fm/api/v1/shops/${shop_id}/orders/${order_id}?api_key=${API_KEY}`;
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(updateBody)
    });

    const putData = await putRes.json();
    console.log('[update-order-prices] PUT status:', putRes.status);

    if (!putRes.ok || putData.success === false) {
      return json({
        success: false,
        message: putData.message || putData.error || 'PUT order thất bại',
        missing_product_ids: missing,
        data: putData
      }, putRes.status || 400);
    }

    return json({
      success: true,
      message: 'Cập nhật retail_price thành công',
      order_id,
      items_updated: updatedItems.length,
      missing_product_ids: missing,
      data: putData.data || putData
    });
  } catch (err) {
    console.log('[update-order-prices] Exception:', err.message, err.stack);
    return json({ success: false, message: err.message || 'Lỗi server' }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}