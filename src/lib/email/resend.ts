interface DeliveryEmailParams {
  to:         string
  parentName: string
  childName:  string
  storyTitle: string
  orderId:    string
}

export async function sendStoryDeliveryEmail(params: DeliveryEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set — skipping delivery email')
    return
  }
  const { to, parentName, childName, storyTitle, orderId } = params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hikayati-nine.vercel.app'
  const storyUrl = `${appUrl}/orders/${orderId}`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    'حكايتي <stories@hikayati.com>',
      to:      [to],
      subject: `🎉 قصة ${childName} جاهزة!`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1A1814;">
          <h2 style="color: #1A1814;">مرحباً ${parentName || ''}،</h2>
          <p style="font-size: 18px; line-height: 1.6;">
            قصة <strong>${childName}</strong> جاهزة!
          </p>
          <p style="color: #6B6560; line-height: 1.6;">
            راجع فريقنا التحريري كل كلمة — للتأكد من جودة اللغة، والسلامة العاطفية، والقيمة التربوية.
          </p>
          ${storyTitle ? `<p style="font-size: 16px; color: #4B4640;">القصة: <strong>${storyTitle}</strong></p>` : ''}
          <div style="margin: 32px 0;">
            <a href="${storyUrl}"
               style="background: #1A1814; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px;">
              اقرأ القصة الآن
            </a>
          </div>
          <p style="color: #6B6560; font-size: 14px;">
            نتمنى أن تُصبح هذه القصة من المفضلات عند ${childName}. 🌟
          </p>
          <hr style="border: none; border-top: 1px solid #E8E4DC; margin: 24px 0;" />
          <p style="color: #9B9590; font-size: 12px; text-align: center;">
            فريق حكايتي ✨
          </p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend API error ${res.status}: ${body}`)
  }

  return res.json()
}
