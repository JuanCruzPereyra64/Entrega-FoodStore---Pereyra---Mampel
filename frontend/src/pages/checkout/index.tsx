import { useEffect, useState } from 'react'
import { useCartStore } from '@/shared/lib/cartStore'
import { usePaymentStore } from '@/shared/lib/paymentStore'
import { crearPedidoApi, procesarPagoApi } from '@/shared/api/api'
import { useNavigate } from 'react-router-dom'

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const CheckoutPage = () => {
  const { items, total, clearCart } = useCartStore()
  const { setPaymentStatus, status } = usePaymentStore()
  const [pedidoId, setPedidoId] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (items.length === 0 && status === 'idle') {
      navigate('/catalogo')
    }
  }, [items, navigate, status])

  useEffect(() => {
    if (pedidoId && window.MercadoPago) {
      const mp = new window.MercadoPago('TEST-4d4b7c6c-8e6d-4d4b-8e6d-4d4b8e6d4d4b', {
        locale: 'es-AR'
      });
      
      const bricksBuilder = mp.bricks();
      
      const renderCardPaymentBrick = async (bricksBuilder: any) => {
        const settings = {
          initialization: {
            amount: total(),
            payer: {
              email: "test_user_123@testuser.com",
            },
          },
          customization: {
            visual: {
              style: {
                theme: 'dark',
              },
            },
          },
          callbacks: {
            onReady: () => {
              console.log('Brick is ready');
            },
            onSubmit: async (formData: any) => {
              setPaymentStatus('processing');
              try {
                const response = await procesarPagoApi({
                  pedido_id: pedidoId,
                  card_token: formData.token,
                  payment_method_id: formData.payment_method_id,
                  installments: formData.installments
                });
                
                if (response.status === 'approved') {
                  setPaymentStatus('approved', null, response.id);
                  clearCart();
                  setTimeout(() => navigate('/pedidos'), 3000);
                } else {
                  setPaymentStatus('rejected', response.status_detail);
                }
              } catch (error) {
                setPaymentStatus('error', 'Ocurrió un error al procesar el pago');
              }
            },
            onError: (error: any) => {
              console.error('Error in brick:', error);
              setPaymentStatus('error', 'Error en el formulario de pago');
            },
          },
        };
        window.cardPaymentBrickController = await bricksBuilder.create(
          'cardPayment',
          'cardPaymentBrick_container',
          settings
        );
      };
      
      renderCardPaymentBrick(bricksBuilder);
    }
  }, [pedidoId, total, setPaymentStatus, clearCart, navigate])

  const handleCrearPedido = async () => {
    try {
      const pedido = await crearPedidoApi({
        items: items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago_codigo: 'MERCADOPAGO',
        notas: 'Pedido realizado desde la web'
      });
      setPedidoId(pedido.id);
    } catch (error) {
      alert('Error al crear el pedido');
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '2rem' }}>Finalizar Compra</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Resumen del Pedido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map(item => (
              <div key={item.producto_id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.cantidad}x {item.nombre}</span>
                <span>${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem', fontWeight: '700', fontSize: '1.2rem' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary)', float: 'right' }}>${total().toFixed(2)}</span>
            </div>
          </div>
          
          {!pedidoId && (
            <button onClick={handleCrearPedido} style={{ marginTop: '2rem' }}>
              Confirmar Pedido y Pagar
            </button>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Pago con Tarjeta</h3>
          
          {!pedidoId && (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '4rem' }}>
              Confirmá el pedido para habilitar el pago.
            </div>
          )}

          {status === 'approved' && (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}>
              <p style={{ fontSize: '3rem' }}>✅</p>
              <h4 style={{ color: '#6ee7b7', marginBottom: '1rem' }}>¡Pago aprobado!</h4>
              <p style={{ fontSize: '0.9rem' }}>Redirigiendo a tus pedidos...</p>
            </div>
          )}

          {status === 'rejected' && (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', marginBottom: '1rem' }}>
              <h4 style={{ color: '#fca5a5' }}>Pago rechazado</h4>
              <p style={{ fontSize: '0.8rem' }}>Por favor intentá con otra tarjeta.</p>
            </div>
          )}

          <div id="cardPaymentBrick_container"></div>
        </div>
      </div>
    </div>
  )
}
