export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const shop_id = url.searchParams.get('shop_id');
    const phone_number = url.searchParams.get('phone_number');

    console.log('[get-orders-by-phone] Query:', { shop_id, phone_number });

    if (!shop_id || !phone_number) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Thiếu shop_id hoặc phone_number'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const API_KEY = env.POS_API_KEY;
    if (!API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Chưa cấu hình POS_API_KEY'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // filter_status[] = 0 (Mới), 1 (Đã xác nhận), 11 (Chờ hàng)
    const params = new URLSearchParams({
      api_key: API_KEY,
      search: phone_number,
      option_sort: 'inserted_at_desc',
      page_size: '50',
      page_number: '1'
    });
    params.append('filter_status[]', '0');
    params.append('filter_status[]', '1');
    params.append('filter_status[]', '11');

    const apiUrl = `https://pos.pages.fm/api/v1/shops/${shop_id}/orders?${params.toString()}`;
    console.log('[get-orders-by-phone] Calling POS API:', apiUrl.replace(API_KEY, '***'));

    const res = await fetch(apiUrl, {
      headers: { Accept: 'application/json' }
    });

    const data = await res.json();
    console.log('[get-orders-by-phone] Status:', res.status);
    console.log('[get-orders-by-phone] total_entries:', data.total_entries);

    if (!res.ok || data.success === false) {
      return new Response(JSON.stringify({
        success: false,
        message: data.message || 'Lấy danh sách đơn thất bại',
        data
      }), {
        status: res.status || 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const orders = data.data || [];

    if (!orders.length) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có đơn trùng SĐT này.',
        data: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      total: orders.length,
      data: orders
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.log('[get-orders-by-phone] Exception:', err.message);
    return new Response(JSON.stringify({
      success: false,
      message: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}