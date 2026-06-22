import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { servicesApi, staffApi, bookingsApi, couponsApi, paymentsApi } from '../api';
import { Service, StaffMember } from '../types';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STEPS = ['Services', 'Staff', 'Date & Time', 'Review', 'Payment'];

export default function BookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [anyStaff, setAnyStaff] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'pay_at_saloon' | 'online'>('pay_at_saloon');
  const [notes, setNotes] = useState('');

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.getAll({ limit: 50 }).then((r) => r.data.data),
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff', selectedServices],
    queryFn: () => staffApi.getAll({ serviceId: selectedServices[0] }).then((r) => r.data.data),
    enabled: selectedServices.length > 0,
  });

  const { data: slotsData, refetch: refetchSlots } = useQuery({
    queryKey: ['slots', date, selectedServices, selectedStaff],
    queryFn: () =>
      staffApi.getAvailability({
        date,
        serviceIds: selectedServices.join(','),
        ...(selectedStaff && !anyStaff && { staffId: selectedStaff }),
      }).then((r) => r.data.data),
    enabled: !!date && selectedServices.length > 0,
  });

  useEffect(() => {
    const preselected = params.get('services');
    if (preselected) setSelectedServices(preselected.split(','));
  }, [params]);

  const services: Service[] = servicesData?.services ?? [];
  const staffList: StaffMember[] = staffData ?? [];
  const selectedServiceObjs = services.filter((s) => selectedServices.includes(s._id));
  const totalAmount = selectedServiceObjs.reduce((s, svc) => s + svc.price, 0);
  const totalDuration = selectedServiceObjs.reduce((s, svc) => s + svc.durationInMinutes, 0);
  const finalAmount = totalAmount - discount;

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const applyCoupon = async () => {
    try {
      const { data } = await couponsApi.validate(couponCode, totalAmount);
      setDiscount(data.data.discountAmount);
      toast.success(`Coupon applied! Saved ₹${data.data.discountAmount}`);
    } catch {
      toast.error('Invalid coupon');
    }
  };

  const createBooking = async () => {
    try {
      const { data } = await bookingsApi.create({
        serviceIds: selectedServices,
        staffId: anyStaff ? undefined : selectedStaff,
        anyAvailableStaff: anyStaff,
        date,
        startTime: time,
        paymentMethod,
        couponCode: couponCode || undefined,
        notes,
      });
      return data.data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Booking failed';
      toast.error(msg);
      throw err;
    }
  };

  const handlePayment = async () => {
    const booking = await createBooking();
    if (paymentMethod === 'pay_at_saloon') {
      navigate(`/booking-confirmation/${booking._id}`);
      return;
    }

    try {
      const { data } = await paymentsApi.createOrder(booking._id);
      const order = data.data;

      // Use mock payment in dev when Razorpay not configured
      if (order.keyId === 'rzp_test_mock' || !import.meta.env.VITE_RAZORPAY_KEY_ID) {
        await paymentsApi.mock(booking._id);
        navigate(`/booking-confirmation/${booking._id}`);
        return;
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Glamour Studio',
        description: 'Saloon Booking',
        order_id: order.orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await paymentsApi.verify({
            bookingId: booking._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          navigate(`/booking-confirmation/${booking._id}`);
        },
      };

      const rzp = new (window as unknown as { Razorpay: new (o: object) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Payment failed');
    }
  };

  const allSlots = slotsData ?? [];
  const availableSlots = anyStaff
    ? [...new Set(allSlots.flatMap((s: { slots: string[] }) => s.slots))].sort()
    : allSlots.find((s: { staffId: string }) => s.staffId === selectedStaff)?.slots ?? [];

  const canNext = () => {
    if (step === 0) return selectedServices.length > 0;
    if (step === 1) return anyStaff || selectedStaff;
    if (step === 2) return date && time;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book Appointment</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? <Check size={16} /> : i + 1}
            </div>
            <span className={`ml-2 text-sm whitespace-nowrap ${i <= step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <ChevronRight size={16} className="mx-2 text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Services</h2>
            <div className="space-y-3">
              {services.map((svc) => (
                <label key={svc._id} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedServices.includes(svc._id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
                }`}>
                  <input type="checkbox" checked={selectedServices.includes(svc._id)} onChange={() => toggleService(svc._id)} className="w-4 h-4 text-primary-600" />
                  <div className="flex-1">
                    <p className="font-medium">{svc.name}</p>
                    <p className="text-sm text-gray-500">{svc.durationInMinutes} min · {svc.category}</p>
                  </div>
                  <span className="font-bold text-primary-600">₹{svc.price}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Choose Stylist</h2>
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer mb-3 ${
              anyStaff ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            }`}>
              <input type="radio" checked={anyStaff} onChange={() => { setAnyStaff(true); setSelectedStaff(null); }} />
              <span className="font-medium">Any Available Staff</span>
            </label>
            {staffList.map((st) => (
              <label key={st._id} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer mb-3 ${
                selectedStaff === st._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}>
                <input type="radio" checked={selectedStaff === st._id && !anyStaff} onChange={() => { setSelectedStaff(st._id); setAnyStaff(false); }} />
                <div>
                  <p className="font-medium">{st.userId.name}</p>
                  <p className="text-sm text-gray-500">⭐ {st.rating} · {st.totalBookingsCompleted} bookings</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Pick Date & Time</h2>
            <input type="date" value={date} min={format(new Date(), 'yyyy-MM-dd')} onChange={(e) => { setDate(e.target.value); setTime(''); refetchSlots(); }} className="input-field mb-4" />
            {date && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.length === 0 ? (
                  <p className="col-span-full text-gray-500 text-sm">No slots available for this date</p>
                ) : (
                  availableSlots.map((slot: string) => (
                    <button key={slot} onClick={() => setTime(slot)} className={`py-2 px-3 rounded-lg text-sm font-medium border ${
                      time === slot ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 hover:border-primary-300'
                    }`}>
                      {slot}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Review Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Services</span><span>{selectedServiceObjs.map((s) => s.name).join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Duration</span><span>{totalDuration} min</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{date} at {time}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{totalAmount}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t pt-3"><span>Total</span><span className="text-primary-600">₹{finalAmount}</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="input-field flex-1" placeholder="Coupon code" />
              <button onClick={applyCoupon} className="btn-secondary">Apply</button>
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field mt-4" placeholder="Notes (optional)" rows={2} />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Payment</h2>
            <div className="space-y-3">
              {/* <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'online' ? 'border-primary-500 bg-primary-50' : ''}`}>
                <input type="radio" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                <div><p className="font-medium">Pay Online</p><p className="text-sm text-gray-500">Razorpay — UPI, Card, Netbanking</p></div>
              </label> */}
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'pay_at_saloon' ? 'border-primary-500 bg-primary-50' : ''}`}>
                <input type="radio" checked={paymentMethod === 'pay_at_saloon'} onChange={() => setPaymentMethod('pay_at_saloon')} />
                <div><p className="font-medium">Pay at Saloon</p><p className="text-sm text-gray-500">Pay when you arrive</p></div>
              </label>
            </div>
            <p className="text-2xl font-bold text-primary-600 mt-4">₹{finalAmount}</p>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="btn-secondary flex items-center gap-1">
            <ChevronLeft size={16} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="btn-primary flex items-center gap-1">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handlePayment} className="btn-primary px-8">
              {paymentMethod === 'online' ? 'Pay & Confirm' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
