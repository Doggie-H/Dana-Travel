/**
 * DATABASE SEED SCRIPT
 * 
 * Script khởi tạo dữ liệu mẫu cho Database.
 * Chạy lệnh: `npx prisma db seed`
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { newLocations } from './data/index.js';
import { transport } from './data/transport.js';

const prisma = new PrismaClient();

// ==========================================
// 1. PREPARE REAL LOCATIONS DATA
// ==========================================
const realLocations = newLocations.map((loc, index) => ({
  ...loc,
  id: `loc_${index + 1}` // Simple ID: loc_1, loc_2, ...
}));

// ==========================================
// 2. KNOWLEDGE BASE DATA (Dữ liệu tri thức)
// ==========================================
const knowledgeData = [
  {
    question: "Bãi biển nào đẹp nhất Đà Nẵng?",
    answer: "Đà Nẵng có 2 bãi biển tuyệt đẹp:\n\n- **Mỹ Khê** - Được Forbes bầu chọn là 1 trong 6 bãi biển quyến rũ nhất hành tinh! Nước trong xanh, cát trắng mịn, view hoàng hôn cực kỳ lãng mạn. Phù hợp tắm biển, chơi thể thao nước.\n\n- **Non Nước** - Yên tĩnh hơn, ít người hơn, thích hợp cho gia đình có trẻ nhỏ hoặc muốn thư giãn. Gần làng nghề chạm đá Non Nước rất nổi tiếng.\n\nMình gợi ý Mỹ Khê nếu bạn thích năng động, Non Nước nếu muốn yên bình nhé!",
    keywords: "travel"
  },
  {
    question: "Cầu Rồng phun lửa lúc nào?",
    answer: "Cầu Rồng phun lửa và phun nước vào **mỗi tối thứ 7 & Chủ nhật, lúc 21:00**!\n\nMình khuyên bạn đến trước 20:30 để tìm chỗ đứng xem đẹp. Vị trí tốt nhất là bờ Đông (gần Vincom Plaza) để chụp ảnh toàn cảnh cầu.\n\nLưu ý: Đừng đứng quá gần nếu không muốn bị ướt nha!",
    keywords: "travel"
  },
  {
    question: "Nên đi Bà Nà Hills vào mùa nào?",
    answer: "Mùa đẹp nhất đi Bà Nà là **tháng 3-5** và **tháng 9-11**:\n\n- **Mùa xuân (3-5)**: Thời tiết mát mẻ 18-25°C, hoa nở rộ, ít mưa\n- **Mùa thu (9-11)**: Không khí trong lành, view mây phủ núi thơ mộng\n\nTránh tháng 6-8 (mưa nhiều, cáp treo có thể tạm dừng) và tháng 12-2 (rét đậm, có thể 8-10°C).\n\nMình sẽ check lịch của bạn và gợi ý ngày đẹp nhất nhé!",
    keywords: "travel"
  },
  {
    question: "Hội An xa Đà Nẵng bao nhiêu km?",
    answer: "Hội An cách Đà Nẵng khoảng **30km**, đi mất tầm 40-50 phút tùy phương tiện:\n\n- **Taxi / Grab Car**: ~200.000-250.000đ một chiều\n- **Xe máy thuê**: 80.000-120.000đ/ngày (tự lái)\n- **Xe buýt số 1**: Chỉ 20.000đ nhưng mất 60-90 phút\n\n- **Thuê xe máy**: 80.000-120.000đ/ngày (tự lái)\n\nMình gợi ý thuê xe máy nếu bạn muốn linh hoạt khám phá nhé! Mùa nào đi cũng đẹp, nhưng đẹp nhất là tối khi lồng đèn bừng sáng!",
    keywords: "travel"
  },
  {
    question: "Từ sân bay Đà Nẵng về trung tâm bằng gì?",
    answer: "Có 4 cách chính:\n\n- **Grab / Xanh SM Taxi** (Khuyên dùng nhất):\n- Khoảng 60.000-100.000đ\n- 15-20 phút đến trung tâm\n- Đặt qua app để tránh chặt chém\n\n- **Taxi truyền thống**:\n- ~120.000-150.000đ (thường đắt hơn)\n\n- **Xe buýt**:\n- Chỉ 5.000-10.000đ, nhưng mất 40-50 phút\n\n- **Thuê xe máy**:\n- 100.000đ/ngày, nhận ngay tại sân bay\n\nBạn có muốn mình gợi ý thêm dịch vụ đưa đón riêng không?",
    keywords: "travel"
  },
  {
    question: "Chợ Hàn mở cửa lúc mấy giờ?",
    answer: "Chợ Hàn mở cửa từ **sáng sớm đến tối muộn**, nhưng có 2 múi giờ:\n\n- **Chợ trong (tầng 1-2)**: 6:00 - 19:00\n- Bán thực phẩm tươi sống, quần áo, đồ lưu niệm\n- Nhộn nhịp nhất lúc 7:00-9:00 sáng\n\n- **Khu ẩm thực tối (xung quanh)**: 18:00 - 23:00\n- Hải sản nướng, bánh tráng cuốn, nem lụi\n- Phải thử nhé!\n\nMình gợi ý đi sáng sớm nếu muốn mua sắm, tối đến nếu muốn ăn uống nhé!",
    keywords: "travel"
  },
  {
    question: "Điểm check-in đẹp ở Đà Nẵng?",
    answer: "Top 5 điểm sống ảo đỉnh cao:\n\n1. **Cầu Vàng (Bà Nà)** - Cây cầu được đỡ bởi đôi bàn tay khổng lồ, view mây trời ảo diệu\n\n2. **Bán đảo Sơn Trà** - Chụp với tượng Phật Quan Âm cao 67m, view biển 360°\n\n3. **Cầu Rồng** - Đẹp nhất vào tối khi đèn led lung linh\n\n4. **Ngũ Hành Sơn** - Chụp ảnh trong hang động tự nhiên, ánh sáng thiên nhiên cực nghệ thuật\n\n5. **Hải Vân Quan** - Đèo biển đẹp nhất Việt Nam, view chữ S uốn lượn thơ mộng\n\nBạn thích style nào? Mình sẽ thêm vào lịch trình cho!",
    keywords: "travel"
  },
  {
    question: "Nên ở khu vực nào gần biển?",
    answer: "Mình gợi ý 3 khu vực:\n\n- **Mỹ Khê (Top choice)**:\n- Ra biển chỉ 2-3 phút đi bộ\n- Nhiều khách sạn 3-5 sao, giá 400k-2tr/đêm\n- Xung quanh nhiều quán ăn, cafe, bar\n- Gần Cầu Rồng, Chợ Hàn\n\n- **Phạm Văn Đồng**:\n- View biển thẳng, yên tĩnh hơn\n- Giá rẻ hơn Mỹ Khê 20-30%\n- Xa trung tâm hơn (4-5km)\n\n- **Sơn Trà**:\n- Resort sang trọng, riêng tư\n- Giá cao (2-5tr/đêm)\n- Thích hợp honeymoon\n\nNgân sách của bạn khoảng bao nhiêu? Mình sẽ gợi ý khách sạn cụ thể nhé!",
    keywords: "travel"
  },
  {
    question: "Thuê xe máy giá bao nhiêu?",
    answer: "Giá thuê xe máy tại Đà Nẵng:\n\n- **Xe số (Honda Wave, Sirius)**: 80.000-100.000đ/ngày\n- **Xe tay ga (Vision, Air Blade)**: 120.000-150.000đ/ngày\n- **Xe phân khối lớn**: 250.000-400.000đ/ngày\n\n- **Lưu ý quan trọng**:\n- Cần GPLX (bằng lái) để thuê hợp pháp\n- Đặt cọc 2-3 triệu hoặc giữ CMND/passport\n- Kiểm tra xe kỹ trước khi nhận (phanh, đèn, lốp)\n- Bảo hiểm thường KHÔNG bao gồm trong giá thuê\n\n- Chỗ thuê uy tín: gần Chợ Hàn, đường Nguyễn Văn Thoại. Bạn có muốn mình gợi ý địa chỉ cụ thể không?",
    keywords: "travel"
  },
  {
    question: "Món ăn đặc sản Đà Nẵng?",
    answer: "Top 7 món PHẢI THỬ khi đến Đà Nẵng:\n\n1. **Mì Quảng** - Đặc sản số 1, nước ít, bún dẹp, thêm bánh tráng nướng\n2. **Bún Chả Cá** - Nước dùng ngọt từ cá, chả cá chiên giòn tan\n3. **Bánh Xèo** - Bánh giòn rụm, ăn kèm rau sống cuốn\n4. **Bánh Tráng Cuốn Thịt Heo** - Đơn giản nhưng cực nghiện!\n5. **Nem Lụi** - Nem nướng mềm, ăn với rau thơm và chấm mắm nêm\n6. **Hải Sản Tươi Sống** - Nhất định phải thử ốc hương, nghêu hấp\n7. **Bún Bò Huế** - Tuy là của Huế nhưng ở Đà Nẵng cũng ngon lắm!\n\nBạn thích món nào? Mình sẽ gợi ý quán ngon nhé!",
    keywords: "food"
  },
  {
    question: "Quán hải sản tươi sống ở đâu ngon?",
    answer: "Top 3 quán hải sản được local khen nức nở:\n\n1. **Bé Mặn** (4.8/5)\n- Hải sản tươi roi rói, giá hợp lý\n- Nổi tiếng: Ốc hương rang me, nghêu hấp xả\n- Giá: 200-400k/người\n- Địa chỉ: Võ Văn Kiệt (gần biển)\n\n2. **Cá Tầm**\n- Chuyên cá tầm size khủng\n- View biển cực chill\n- Giá: 300-500k/người\n\n3. **Hải Sản Thần Phù**\n- Bình dân hơn, đông khách local\n- Giá: 150-250k/người\n\nBạn đi mấy người? Mình gợi ý món order cho vừa vặn!",
    keywords: "food"
  },
  {
    question: "Bún chá cá nổi tiếng nhất ở đâu?",
    answer: "Có 2 quán bún chá cá siêu ĐỈNH:\n\n1. **Bún Chả Cá 82 Phan Châu Trinh** (Quán gốc) 4.9/5\n- Được coi là \"nguyên tổ\" bún chá cá Đà Nẵng\n- Chả cá chiên giòn tan, nước dùng ngọt thanh\n- Giá: 35.000đ/tô\n- Tip: Đến trước 11h để không phải xếp hàng!\n\n2. **Bún Chả Cá Nguyễn Tri Phương**\n- Nước dùng đậm đà hơn\n- Nhiều topping hơn\n- Giá: 40.000đ/tô\n\nMình thích quán 82 hơn vì authentic và đúng vị! Bạn muốn thêm vào lịch trình không?",
    keywords: "food"
  },
  {
    question: "Quán cà phê view biển đẹp?",
    answer: "Top 5 quán cafe view biển must-visit:\n\n1. **Love Nest Coffee**\n- View 180° nhìn thẳng ra Mỹ Khê\n- Hoàng hôn đẹp nhất Đà Nẵng\n- Giá: 40-70k/ly\n\n2. **43 Factory Coffee Roaster**\n- Industrial style, chill nhất\n- Rooftop view siêu đỉnh\n- Giá: 50-80k/ly\n\n3. **RBK Roastery**\n- Hướng ra bán đảo Sơn Trà\n- Chill, yên tĩnh\n- Giá: 45-65k/ly\n\n4. **Maison De Nem** \n- View chill, có món ăn nhẹ\n- Giá: 35-60k\n\n5. **The One Coffee**\n- Rooftop 360°, sống ảo đỉnh\n- Giá: 40-70k\n\nBạn thích style nào? Vintage hay hiện đại?",
    keywords: "food"
  },
  {
    question: "Ăn sáng ở đâu ngon Đà Nẵng?",
    answer: "Đà Nẵng có cả tá món ăn sáng tuyệt vời:\n\n- **Mì Quảng Bà Mua** (6:00-10:00)\n- Truyền thống nhất, ngon nhất!\n- 30.000-40.000đ/tô\n- Lưu ý: Đến sớm kẻo hết!\n\n- **Phở Hòa Pasteur**\n- Phở bò Nam Định authentic\n- 45.000đ/tô\n- 6:30-10:30\n\n- **Bánh Mì Phượng** (Chi nhánh Đà Nẵng)\n- Bánh mì pate ngon nhất\n- 20.000-25.000đ/ổ\n\n- **Quán Cháo Lòng** (Lê Duẩn)\n- Cháo lòng nóng hổi\n- 25.000đ/tô\n\n- **Cà Phê Sáng** + **Bánh Mì Que**\n- Combo truyền thống của dân Đà Nẵng\n- 30.000đ cả set\n\nBạn thích món nào? Mình sẽ chỉ đường nhé!",
    keywords: "food"
  },
  {
    question: "Nhà hàng buffet hải sản nào ngon?",
    answer: "Top 3 buffet hải sản Đà Nẵng:\n\n1. **Paramount Buffet** (Brilliant Hotel)\n- Hải sản tươi sống: tôm hùm, cua king, sò điệp\n- Hơn 100 món\n- Giá: 599k-799k/người (tùy ngày)\n- Booking: 0236.3888.888\n\n2. **New Cham Buffet** (4.5/5)\n- Buffet lẩu hải sản + nướng\n- Unlimited cua, tôm, mực\n- Giá: 399k-499k/người\n\n3. **BBQ Garden** (Hyatt Regency)\n- Sang trọng nhất\n- BBQ + hải sản\n- Giá: 899k-1.2tr/người\n\nNgân sách của bạn bao nhiêu? Mình sẽ recommend phù hợp nhất!",
    keywords: "food"
  },
  {
    question: "Quán ăn vặt tối ở đâu?",
    answer: "Đà Nẵng ăn vặt tối cực thơm:\n\n- **Hàng Gốc Đại Lộ (Phan Đăng Lưu)**\n- Bánh tráng cuốn thịt heo\n- Nem lụi nướng\n- 20-30k/phần\n- Đông nhất 18:00-22:00\n\n- **Chợ Cồn** (Chợ đêm)\n- Cả khu ăn vặt:\n- Bánh bèo, bánh ít, ra m\n- Chè, trà sữa\n- 15-40k/món\n\n- **Khu Ăn Vặt Châu Thị Tế**\n- Gà nướng lu, chân gà sả\n- Giá rẻ, đông sinh viên\n- 25-50k\n\n- **Nướng BBQ đường Trần Phú**\n- Xiên nướng, nem nướng\n- Vỉa hè, vibe local\n- 5-10k/xiên\n\nBạn ở gần đâu? Mình chỉ quán gần nhất!",
    keywords: "food"
  },
  {
    question: "Đi Grab hay Taxi ở Đà Nẵng?",
    answer: "Mình khuyên bạn dùng **Grab / Xanh SM** vì:\n\n- **Ưu điểm**:\n- Giá cố định, minh bạch (không lo chặt chém)\n- Đánh giá tài xế (chọn người đánh giá cao)\n- Có bảo hiểm hành trình\n- Thanh toán linh hoạt (tiền mặt/thẻ)\n\n- **So sánh giá**:\n- **Grab Bike**: ~12k/2km đầu, ~4k/km sau\n- **Grab Car**: ~25k/2km đầu, ~10k/km sau\n- **Xanh SM Taxi (điện)**: ~20k mở cửa, ~11-12k/km (êm hơn nhưng hơi đắt)\n- **Taxi truyền thống**: Thường đắt hơn 20-30%, có thể chặt chém\n\n- **Tips**:\n- Giờ cao điểm (7-9h sáng, 17-19h chiều): giá tăng 1.2-1.5x\n- Trời mưa: khan hiếm xe, giá tăng\n- Booking trước 10-15 phút sẽ rẻ hơn\n\nBạn cần đặt xe đi đâu không? Mình tính giá luôn!",
    keywords: "practical"
  },
  {
    question: "ATM ở đâu gần?",
    answer: "ATM ở Đà Nẵng rất nhiều, tập trung tại:\n\n- **Khu trung tâm**:\n- Gần Cầu Rồng: Agribank, Vietcombank, BIDV\n- Chợ Hàn: Techcombank, VPBank, MB\n- Vincom Plaza: Có cả cụm ATM 5-6 ngân hàng\n\n- **Khu Mỹ Khê**:\n- Lotte Mart: MB, Techcombank, Sacombank\n- Big C: Vietinbank, BIDV\n\n- **Phí rút tiền**:\n- Cùng ngân hàng: FREE\n- Khác ngân hàng: 1.100-3.300đ/lần\n- ATM quốc tế (Visa/Master): 20.000-55.000đ + 3% phí\n\n- **Lưu ý**:\n- Tránh rút ATM ở sân bay (phí cao)\n- Ngân hàng nào FREE: MB, TPBank, VPBank (liên kết với nhau)\n\nBạn đang ở đâu? Mình chỉ ATM gần nhất!",
    keywords: "practical"
  },
  {
    question: "Thuê sim 4G ở đâu?",
    answer: "Có 3 cách mua SIM 4G:\n\n- **Tại sân bay**:\n- Quầy Viettel, Mobifone ngay khu nhận hành lý\n- Gói du lịch: 100-200k (3-7 ngày, 2-4GB/ngày)\n- Tiện nhưng hơi đắt 20%\n\n- **Cửa hàng chính hãng** (Khuyên dùng):\n- Viettel, Mobifone, Vinaphone khắp nơi\n- Gói rẻ hơn: 70-150k (3-7 ngày)\n- Cần CMND/Passport để đăng ký\n\n- **Mua online trước**:\n- Klook, Traveloka có bán\n- Nhận tại sân bay hoặc khách sạn\n- Giá tốt: 50-120k\n\n- **Nhà mạng nào tốt**:\n- **Viettel**: Phủ sóng tốt nhất (⭐⭐⭐⭐⭐)\n- **Mobifone**: Tốt ở thành phố (⭐⭐⭐⭐)\n- **Vinaphone**: Rẻ nhưng sóng yếu hơn (⭐⭐⭐)\n\nBạn ở Việt Nam bao nhiêu ngày? Mình gợi ý gói phù hợp nhé!",
    keywords: "practical"
  },
  {
    question: "Thời tiết Đà Nẵng tháng 12 như thế nào?",
    answer: "Tháng 12 là mùa đông ở Đà Nẵng:\n\n- **Nhiệt độ**: 20-26°C\n- Ban ngày: 24-26°C (ấm áp)\n- Ban đêm: 19-21°C (mát mẻ, cần áo khoác nhẹ)\n\n- **Mưa**: Trung bình 15-20 ngày/tháng\n- Mưa rào ngắn (30-60 phút)\n- Thường vào chiều tối hoặc đêm\n- Ít khi mưa cả ngày\n\n- **Biển**: Sóng to, nước hơi lạnh\n- Vẫn tắm được nhưng mát hơn tháng 5-8\n- An toàn hơn tháng 9-11 (mùa bão)\n\n- **Nên mang gì**:\n- Áo khoác nhẹ cho buổi tối\n- Dù / áo mưa\n- Quần áo mùa hè vẫn OK ban ngày\n\n- **Hoạt động phù hợp**:\n- Tham quan: Bà Nà, Hội An (mát mẻ, dễ chịu)\n- Tắm biển: được nhưng nắng ít hơn\n- Trekking: Thời tiết lý tưởng!\n\nBạn muốn đi du lịch tháng 12 à? Mình sẽ lên lịch trình tránh mưa nhé!",
    keywords: "practical"
  },
  {
    question: "Đổi tiền ở đâu tỷ giá tốt?",
    answer: "Đổi tiền tại Đà Nẵng:\n\n- **Tỷ giá tốt nhất** (TOP 3):\n\n1. **Ngân hàng (Vietcombank, BIDV)**\n- Tỷ giá chuẩn, an toàn\n- Cần passport\n- Giờ làm việc: 8:00-16:30 (T2-T6), sáng T7\n\n2. **Tiệm Vàng Quy Nhơn, Phú Quý** (Chợ Hàn)\n- Tỷ giá tốt, đông local tin dùng\n- Không cần giấy tờ\n- Mở cửa đến tối\n\n3. **Khách sạn 4-5 sao**\n- Tiện nhưng tỷ giá kém hơn 1-2%\n\n- **TRÁNH**:\n- Sân bay (tỷ giá tệ nhất, kém 3-5%)\n- Tiệm vàng lạ (có thể gặp tiền giả)\n- Đổi từng ít (phí cao)\n\n- **Tip**:\n- Đổi 100-200 USD một lần để tỷ giá tốt\n- Dùng thẻ ATM quốc tế rút tiền (phí ~3% nhưng tiện)\n- Cầu Rồng tiền giả nhiều, cẩn thận!\n\nBạn cần đổi bao nhiêu? Mình chỉ chỗ gần nhất!",
    keywords: "practical"
  },
  {
    question: "Đà Nẵng có an toàn không?",
    answer: "Đà Nẵng là thành phố **RẤT AN TOÀN** so với các nơi khác:\n\n- **Điểm mạnh**:\n- Tỷ lệ tội phạm thấp\n- Người dân thân thiện, hiếu khách\n- Cảnh sát du lịch tuần tra thường xuyên\n- Đường phố sáng đèn, ít ngõ hẻm tối\n\n- **Lưu ý nhỏ**:\n1. **Móc túi**: Ít xảy ra nhưng vẫn cần cẩn thận ở chợ, khu du lịch đông người\n2. **Chặt chém**: Một số taxi, quán ăn gần tourist spot\n3. **Lừa đảo**: Tại sân bay có người giả vờ giúp đỡ rồi đòi tiền\n\n- **Tips an toàn**:\n- Dùng Grab thay vì taxi vàng\n- Không để giá trị cao trong xe máy khi gửi\n- Hỏi giá trước khi ăn (nếu quán không có menu)\n- Cất passport ở khách sạn, mang copy\n- Tránh dạo phố quá khuya (sau 23:00)\n\n- **Hotline khẩn cấp**:\n- Cảnh sát: 113\n- Cứu hỏa: 114\n- Cấp cứu: 115\n- Du lịch Đà Nẵng: 0511.3550.111\n\nYên tâm đi chơi nhé! Đà Nẵng an toàn lắm!",
    keywords: "practical"
  },
  {
    question: "Đi Ngũ Hành Sơn mất bao lâu?",
    answer: "Ngũ Hành Sơn (Marble Mountains) cách trung tâm ~8km:\n\n- **Thời gian di chuyển**:\n- Grab Car: 20 phút (~80k)\n- Xe máy: 15 phút\n- Xe buýt: 40 phút (~10k)\n\n- **Thời gian tham quan**: 2-3 giờ\n- Leo núi + tham quan chùa: 1.5 giờ\n- Khám phá hang động: 1 giờ\n- Chụp ảnh, nghỉ: 30 phút\n\n- **Vé tham quan**:\n- Vé vào cổng: 40.000đ\n- Thang máy: 40.000đ (hoặc leo 156 bậc FREE)\n- Điện Huyền Không: 20.000đ\n\n- **Tips**:\n- Đi buổi sáng (7-9h) tránh nắng\n- Mang nước, khăn lau mồ hôi\n- Mặc giày thể thao (sẽ leo núi)\n- Tôn trọng khu vực linh thiên để (váy dài, áo kín vai)\n\nMuốn mình thêm vào lịch trình không?",
    keywords: "travel"
  },
  {
    question: "Tôi cần tiết kiệm ngân sách",
    answer: "Mình sẽ giúp bạn du lịch Đà Nẵng tiết kiệm:\n\n- **Giảm chi phí ăn uống** (30-40%):\n- Ăn ở quán local thay vì nhà hàng tourist\n- Mì Quảng, Bún chả cá: 30-40k/tô thay vì 100k\n- Cafe nhỏ: 15-25k thay vì 50-70k\n\n- **Giảm chi phí ở** (40-50%):\n- Homestay/Hostel: 100-200k/đêm thay vì hotel 500k+\n- Ở khu Phạm Văn Đồng rẻ hơn Mỹ Khê 30%\n\n- **Giảm chi phí di chuyển**:\n- Grab Bike thay vì Car (rẻ hơn 60%)\n- Thuê xe máy: 100k/ngày đi cả ngày\n- Đi bộ khu Mỹ Khê - Cầu Rồng - Chợ Hàn (FREE!)\n\n- **Địa điểm FREE**:\n- Bãi biển Mỹ Khê, Non Nước\n- Cầu Rồng, Cầu Tình Yêu\n- Chợ Hàn (không mua gì vẫn ngắm được)\n- Công viên biển\n\n- **Ví dụ ngân sách tiết kiệm** (1 người/ngày):\n- Ăn: 150k (3 bữa)\n- Xe: 100k (thuê máy cả ngày)\n- Tham quan: 50k (đa số FREE)\n- **Tổng: 300k/ngày** thay vì 800k-1tr!\n\nBạn đi mấy ngày? Ngân sách bao nhiêu? Mình lên kế hoạch chi tiết nhé!",
    keywords: "practical"
  },
  {
    question: "Mang gì khi đi biển?",
    answer: "Checklist đi biển Đà Nẵng:\n\n- **BẮT BUỘC** phải mang:\n- Đồ bơi, khăn tắm\n- Kem chống nắng SPF50+ (nắng Đà Nẵng rất gắt!)\n- Dép tông / dép lê\n- Nước uống (1-2 chai)\n- Túi đựng đồ ướt\n\n- **NÊN MANG**:\n- Mắt kính chống UV\n- Mũ / nón\n- Áo khoác mỏng che nắng\n- Túi chống nước cho điện thoại (nếu chụp ảnh dưới nước)\n\n- **An toàn**:\n- Phao bơi (nếu không biết bơi)\n- Thuốc cá nhân (nếu có)\n- Túi rác (giữ gìn môi trường)\n\n- **TRÁNH mang**:\n- Đồ trang sức đắt tiền\n- Laptop, máy ảnh đắt (nước biển + cát sẽ hư)\n- Quá nhiều tiền mặt\n\n- **Gửi đồ**:\n- Nhà vệ sinh công cộng Mỹ Khê: 10k/tủ\n- Resort bãi biển: 20-50k/tủ (có vòi hoa sen)\n\n- **Tip**: Đi buổi sáng (6-10h) hoặc chiều (16-18h) tránh nắng gắt!",
    keywords: "practical"
  },
  // === THÊM MỚI: GIẢI TRÍ & VUI CHƠI ===
  {
    question: "Bar club ở Đà Nẵng vui ở đâu?",
    answer: "Nightlife Đà Nẵng không sôi động bằng Sài Gòn nhưng vẫn có vài điểm đáng chơi:\n\n1. **Brilliant Top Bar** (Brilliant Hotel)\n- Rooftop bar cao nhất Đà Nẵng\n- View 360° cực đỉnh\n- Cocktail 150-300k\n- Mở: 17:00-01:00\n\n2. **Sky36** (Novotel)\n- Club + bar trong một\n- Nhạc EDM cuối tuần\n- Đông khách nước ngoài\n- Mở: 21:00-02:00\n\n3. **Bamboo 2 Bar** (An Thượng)\n- Phong cách pub chill\n- Bia rẻ, vibe thân thiện\n- Nhiều khách Tây\n\n4. **Golden Pine Pub**\n- Karaoke + bar\n- Nhạc live cuối tuần\n\nBạn thích style club nhảy hay bar chill?",
    keywords: "entertainment"
  },
  {
    question: "Chỗ chơi cho trẻ em ở đâu?",
    answer: "Đà Nẵng có nhiều chỗ vui chơi cho các bé:\n\n- **Asia Park - Công viên Châu Á** (Phải thử!)\n- Khu vui chơi + đu quay khổng lồ Sun Wheel\n- Vé: 250-300k/trẻ em, 350k/người lớn\n- Mở: 15:30-22:00\n- Tối đẹp hơn, có đèn lung linh\n\n- **Helio Center**\n- Khu game, máy gắp thú\n- Bowling, trượt băng\n- Vé: tùy game, 50-150k/lượt\n\n- **Bãi biển Mỹ Khê**\n- Xây lâu đài cát (FREE!)\n- Thuê phao, đồ chơi biển\n\n- **Bảo tàng 3D Art in Paradise**\n- Chụp ảnh 3D vui nhộn\n- Vé: 150k/trẻ em, 200k/người lớn\n\n- **Công viên nước Mikazuki**\n- Water park hiện đại\n- Vé: 450-550k/người\n\nBé nhà bạn mấy tuổi? Mình gợi ý phù hợp nhất nhé!",
    keywords: "family"
  },
  {
    question: "Khu vực An Thượng có gì?",
    answer: "An Thượng được mệnh danh là \"phố Tây\" của Đà Nẵng:\n\n- **Đặc điểm**:\n- Khu tập trung nhiều nhà hàng, bar, cafe phong cách Tây\n- Nhiều khách du lịch nước ngoài\n- Vibe sôi động từ chiều đến đêm\n- Cách biển Mỹ Khê chỉ 5 phút đi bộ\n\n- **Ăn uống nổi bật**:\n- Pizza: Pizza 4P's, Pepperonis\n- Burger: Fatty's\n- Hải sản: Bé Mặn, Hải Sản Phố\n- Brunch: The Early Bird, Oasis\n\n- **Uống**:\n- Coffee: 43 Factory, Cộng Cà Phê\n- Bar: Bamboo 2, Luna Pub, On The Radio\n- Smoothie Bowl: Oasis\n\n- **Mua sắm**:\n- Quần áo boutique\n- Đồ handmade\n- Xưởng gốm tự làm\n\n- **Tip**: Đi buổi tối từ 17:00 trở đi cho vibe tốt nhất!\n\nBạn muốn ăn uống hay bar hopping ở An Thượng?",
    keywords: "travel"
  },
  {
    question: "Lịch trình cho cặp đôi honeymoon?",
    answer: "Mình gợi ý lịch trình lãng mạn cho 2 người:\n\n- **Ngày 1: Biển & Sunset**\n- Sáng: Tắm biển Mỹ Khê\n- Trưa: Ăn hải sản tại Bé Mặn\n- Chiều: Spa couple tại resort\n- Tối: Dinner view biển + ngắm Cầu Rồng phun lửa (nếu T7/CN)\n\n- **Ngày 2: Bà Nà - Cầu Vàng**\n- Cả ngày ở Bà Nà Hills\n- Chụp ảnh Cầu Vàng romantic\n- Dạo vườn hoa, khu Pháp\n- Tối: Dinner tại nhà hàng lãng mạn An Thượng\n\n- **Ngày 3: Sơn Trà & Chill**\n- Sáng: Ngắm bình minh ở Bán đảo Sơn Trà\n- Trưa: Cafe view biển\n- Chiều: Check-in resort Sơn Trà (intercontinental...)\n- Tối: Private dinner at resort\n\n- **Recommended resorts cho honeymoon**:\n- InterContinental Sơn Trà (sang nhất)\n- Furama Resort (classic luxury)\n- TIA Wellness Resort (spa focused)\n\nNgân sách 2 người bao nhiêu? Mình điều chỉnh cho phù hợp nhé!",
    keywords: "couples"
  },
  {
    question: "Thời tiết hôm nay thế nào?",
    answer: "Mình không thể xem thời tiết real-time, nhưng có thể gợi ý:\n\n- **Kiểm tra thời tiết chính xác**:\n- App: Weather.com, Windy, AccuWeather\n- Google: \"Thời tiết Đà Nẵng hôm nay\"\n\n- **Nếu trời nắng** (Đi đâu?):\n- Biển Mỹ Khê, Non Nước\n- Bán đảo Sơn Trà\n- Asia Park (chiều-tối)\n\n- **Nếu trời mưa** (Đi đâu?):\n- Bà Nà Hills (có khu trong nhà)\n- Bảo tàng Chăm, 3D Art\n- Spa, massage\n- Shopping Vincom, Lotte\n- Cafe đọc sách\n\n- **Nếu mây mù** (Best for):\n- Ngũ Hành Sơn (bớt nắng)\n- Hội An (chụp ảnh đẹp hơn)\n\nBạn muốn mình gợi ý lịch trình theo thời tiết không?",
    keywords: "weather"
  },
  {
    question: "Trời mưa đi đâu cho vui?",
    answer: "Đừng lo, Đà Nẵng mưa vẫn có chỗ chơi:\n\n- **Mua sắm & Giải trí trong nhà**:\n- Vincom Plaza: Shopping + Lotte Cinema\n- Helio Center: Game, bowling, trượt băng\n- Big C, Lotte Mart: Siêu thị + khu ăn uống\n\n- **Văn hóa & Nghệ thuật**:\n- Bảo tàng Chăm: Văn hóa Champa độc đáo (Vé: 60k)\n- Bảo tàng 3D Art in Paradise (Vé: 200k)\n- Bảo tàng Đà Nẵng\n\n- **Thư giãn**:\n- Spa massage: Herbal, Queen, Lavender\n- Jjimjilbang (sauna kiểu Hàn): Golden Lotus\n- Cafe đọc sách: The Espresso Station\n\n- **Ăn uống thả ga**:\n- Buffet lẩu, nướng\n- Workshop làm bánh\n- Cooking class (học nấu mì Quảng)\n\nMưa thường rào khoảng 30-60 phút là tạnh. Cứ đợi trong quán cafe rồi đi tiếp nhé!",
    keywords: "weather"
  },
  {
    question: "Chụp ảnh đẹp ở đâu buổi sáng?",
    answer: "Sáng sớm là thời điểm vàng để chụp ảnh:\n\n- **Bình minh (5:30-6:30)**:\n- Biển Mỹ Khê: Ánh nắng vàng trên biển\n- Bán đảo Sơn Trà: View toàn cảnh thành phố\n- Hải Vân Quan: Mây mù bao phủ núi\n\n- **Sáng sớm (6:00-8:00)**:\n- Cầu Rồng, Cầu Tình Yêu: Vắng người, chụp thoải mái\n- Chợ Hàn: Đông vui, local vibe\n- Làng bích họa Tam Thanh (Hội An)\n\n- **Sáng muộn (8:00-10:00)**:\n- Ngũ Hành Sơn: Ánh sáng hang động đẹp nhất\n- Chùa Linh Ứng: Tượng Phật ánh sáng đẹp\n- Phố cổ Hội An: Vắng du khách, ảnh trong veo\n\n- **Tips chụp ảnh**:\n- Mặc áo dài tại Hội An (thuê 150k/bộ)\n- Dùng mode HDR khi chụp biển\n- Tránh 11:00-14:00 (nắng gắt, bóng đổ xấu)\n\nBạn thích style ảnh gì? Thiên nhiên hay phố phường?",
    keywords: "travel"
  },
  {
    question: "Đi Huế từ Đà Nẵng bằng gì?",
    answer: "Huế cách Đà Nẵng ~100km, có 3 cách đi:\n\n1. **Tàu lửa** (Recommend nhất!)\n- Giá: 65.000-95.000đ\n- Thời gian: 2.5-3 giờ\n- View đèo Hải Vân siêu đẹp!\n- Mua vé: dsvn.vn hoặc ga Đà Nẵng\n\n2. **Xe khách**\n- Giá: 80.000-120.000đ\n- Thời gian: 2-2.5 giờ (đi hầm)\n- Tiện: đón tại khách sạn\n- Hãng: Sinh Cafe, Hoàng Long\n\n3. **Grab / Taxi**\n- Giá: 800.000-1.000.000đ (1 chiều)\n- Thời gian: 1.5-2 giờ\n- Linh hoạt, ghé Lăng Cô được\n\n4. **Xe máy** (Phượt)\n- Thời gian: 3-4 giờ\n- Chi phí: xăng ~150k\n- Đi đèo Hải Vân rất đẹp!\n- Lưu ý: cần bằng lái, cẩn thận đèo\n\n- **Tips**:\n- Đi tàu sáng sớm (6:00) để có cả ngày ở Huế\n- Nếu đi đèo Hải Vân, xuất phát 5:00-6:00 sáng\n\nBạn muốn đi ngày nào? Ở Huế bao lâu?",
    keywords: "travel"
  },
  {
    question: "Massage spa ở đâu tốt?",
    answer: "Top spa massage tại Đà Nẵng:\n\n- **Cao cấp (500k-1.5tr)**:\n- Charm Spa: Đẹp nhất, service 5 sao\n- Herbal Spa: Nổi tiếng massage Việt Nam\n- Queen Spa: Đông khách Tây\n\n- **Trung cấp (200-400k)**:\n- Lavender Spa: Giá tốt, chất lượng ổn\n- Golden Lotus: Có jjimjilbang Hàn Quốc\n- Pink Spa: Phù hợp couple\n\n- **Bình dân (100-200k)**:\n- Các tiệm foot massage đường Lê Duẩn\n- Massage điếc ở Chợ Hàn (80k/h)\n\n- **Package đặc biệt**:\n- Couple spa (2 người): 800k-1.5tr/2h\n- Full body + facial: 500-800k/2h\n- Hot stone therapy: +100-150k\n\n- **Booking tips**:\n- Đặt trước 1-2 giờ (nhất là cuối tuần)\n- Tip 50-100k nếu hài lòng\n- Lưu ý: một số spa \"trá hình\" - chọn nơi review tốt!",
    keywords: "entertainment"
  },
  {
    question: "Có chỗ nào yên tĩnh để làm việc?",
    answer: "Đà Nẵng có nhiều cafe/coworking phù hợp làm việc:\n\n- **Coworking Space**:\n- Toong (Đà Nẵng): 50k/giờ hoặc 200k/ngày\n- Danang Coworking: 40k/giờ\n- Dreamplex: 150k/ngày\n\n- **Cafe yên tĩnh** (Wifi mạnh):\n- The Espresso Station: Yên tĩnh, có ổ điện\n- 43 Factory: Industrial style, tầng 2 vắng\n- Cộng Cà Phê: Nhiều chỗ ngồi, AC tốt\n- Highlands Coffee (Vincom): Tiện, có phòng riêng\n\n- **Hotel Lobby/Lounge**:\n- Novotel: View đẹp, yên tĩnh\n- Brilliant: Rooftop có wifi\n\n- **Tips làm việc**:\n- Tránh cafe view biển (nhiều gió, ồn)\n- Mang sạc dự phòng\n- Peak hour: 8-11h sáng, sau 14h vắng hơn\n- Gọi món 50k+ để ngồi lâu không ngại\n\nBạn cần làm việc bao lâu? Mình gợi ý chỗ gần nhất!",
    keywords: "practical"
  },
  {
    question: "Ăn chay ở đâu ngon?",
    answer: "Đà Nẵng có nhiều quán chay ngon:\n\n- **Quán chay nổi tiếng**:\n1. **Hum Vegetarian**\n- Chay hiện đại, đẹp, fine dining\n- Giá: 80-150k/món\n- Địa chỉ: Trần Phú\n\n2. **Quán Chay Tâm Như**\n- Buffet chay: 60k/người\n- Đông khách local\n- Giờ ăn trưa ngon nhất\n\n3. **Loving Hut**\n- Chain quốc tế, menu đa dạng\n- Giá: 40-80k/món\n- Có English menu\n\n- **Quán cơm chay bình dân** (20-40k):\n- Quán chay đường Lê Duẩn\n- Cơm chay Thiện Tâm\n- Quán chay chợ Hàn\n\n- **Lưu ý**:\n- Nhiều quán chay chỉ mở buổi trưa (10:30-13:30)\n- Ngày rằm, mùng 1 đông hơn\n- Một số quán dùng tỏi hành - hỏi trước nếu cần thuần chay\n\nBạn ăn chay trường hay chỉ hôm nay? Mình gợi ý phù hợp nhé!",
    keywords: "food"
  },
  {
    question: "Xin chào",
    answer: "Chào bạn! Mình là trợ lý du lịch riêng của bạn tại Đà Nẵng.\n\nMình có thể giúp bạn:\n- Gợi ý địa điểm tham quan, ăn uống\n- Tư vấn lịch trình phù hợp ngân sách\n- Giải đáp thắc mắc về di chuyển, thời tiết\n- Điều chỉnh lịch trình đã có\n\nBạn đang cần trợ giúp gì nhỉ?",
    keywords: "general"
  },
  {
    question: "Cảm ơn",
    answer: "Không có gì đâu! Mình rất vui được đồng hành cùng bạn trong chuyến đi Đà Nẵng này.\n\nNếu cần thêm gì trong suốt chuyến đi, cứ nhắn mình nhé. Chúc bạn có những trải nghiệm tuyệt vời tại thành phố biển này!",
    keywords: "general"
  },
  {
    question: "Bạn là ai?",
    answer: "Mình là trợ lý du lịch AI của Dana Travel - một người bạn đồng hành am hiểu Đà Nẵng.\n\nMình được tạo ra để giúp bạn:\n- Lên kế hoạch du lịch thông minh\n- Gợi ý địa điểm phù hợp sở thích và ngân sách\n- Giải đáp mọi thắc mắc về Đà Nẵng\n- Điều chỉnh lịch trình linh hoạt\n\nTuy là AI, nhưng mình biết khá nhiều về Đà Nẵng đấy! Bạn cứ thử hỏi xem.",
    keywords: "general"
  },
  {
    question: "Đặt tour ở đâu uy tín?",
    answer: "Có nhiều cách đặt tour tại Đà Nẵng:\n\n- **Online** (Tiện, so sánh giá dễ):\n- Klook, Traveloka: Đa dạng, giá tốt\n- GetYourGuide: Tour chất lượng cao\n- Booking.com: Combo hotel + tour\n\n- **Công ty local** (Giá tốt, hỗ trợ tiếng Việt):\n- Vietravel: Lớn nhất, nhiều chi nhánh\n- Tugo: Tour cao cấp\n- Danang Fantasticity: Chuyên Đà Nẵng\n\n- **Tour phổ biến**:\n- Bà Nà 1 ngày: 1.5-2tr (bao vé, xe)\n- Hội An ban đêm: 300-500k\n- Huế 1 ngày: 800k-1.2tr\n- Cù Lao Chàm: 600-900k (bao thuyền, ăn)\n- Sơn Trà Jeep Tour: 500-800k\n\n- **Tips**:\n- Đọc review trước khi đặt\n- Hỏi rõ bao gồm những gì\n- Đặt trước 1-2 ngày, nhất là mùa cao điểm\n\nBạn muốn đi tour nào? Mình check giá cho!",
    keywords: "practical"
  },
  {
    question: "Có wifi free không?",
    answer: "Wifi tại Đà Nẵng khá phổ biến:\n\n- **WiFi FREE**:\n- Hầu hết cafe, nhà hàng\n- Khách sạn, resort\n- Sân bay Đà Nẵng\n- Trung tâm thương mại (Vincom, Lotte)\n- Một số khu vực công cộng (chợ Hàn, phố đi bộ)\n\n- **Tốc độ**:\n- Cafe/Nhà hàng: 10-50 Mbps (đủ dùng)\n- Khách sạn: 20-100 Mbps\n- Coworking: 50-200 Mbps\n\n- **Nếu cần net ổn định**:\n- Mua SIM 4G (70-150k/7 ngày, data không giới hạn)\n- Thuê pocket wifi (50-80k/ngày)\n\n- **Lưu ý**:\n- Bãi biển không có wifi (dùng 4G)\n- Núi, vùng xa wifi yếu\n- Peak hour (19-22h) có thể chậm\n\nBạn cần net để làm gì? Nếu làm việc, mình gợi ý cafe có net mạnh nhé!",
    keywords: "practical"
  },
  // === THÊM MỚI: HỘI THOẠI THÔNG MINH ===
  {
    question: "Tạm biệt",
    answer: "Tạm biệt bạn! Chúc bạn có chuyến du lịch Đà Nẵng thật tuyệt vời và nhiều kỷ niệm đẹp. Nhớ ghé lại Dana Travel khi cần tư vấn nhé!",
    keywords: "general"
  },
  {
    question: "Chào buổi sáng",
    answer: "Chào buổi sáng! Hôm nay bạn có kế hoạch gì chưa? Đà Nẵng buổi sáng rất đẹp - nếu dậy sớm được thì đi biển ngắm bình minh hoặc ăn sáng local nhé!",
    keywords: "general"
  },
  {
    question: "Mệt quá",
    answer: "Mình hiểu! Du lịch đi bộ nhiều mệt lắm. Gợi ý cho bạn:\n\n- **Nghỉ ngơi**: Về khách sạn nằm 1-2 tiếng\n- **Thư giãn**: Đi massage/spa (từ 150k/h)\n- **Chill nhẹ**: Ngồi cafe view biển, uống nước dừa\n- **Tối nay**: Ăn buffet thay vì đi bộ tìm quán\n\nBạn muốn mình gợi ý spa gần đây không?",
    keywords: "general"
  },
  {
    question: "Đói bụng",
    answer: "Đói rồi hả! Bạn đang ở khu nào? Mình gợi ý nhanh:\n\n- **Món nhanh**: Bánh mì (20k), Phở (45k)\n- **Đặc sản**: Mì Quảng (35k), Bún chả cá (40k)\n- **Hải sản**: Bé Mặn, Hải Sản Phố (200-400k/người)\n- **Buffet**: Paramount, New Cham (400-800k)\n\nBạn thích ăn gì? Ngân sách bao nhiêu?",
    keywords: "food"
  },
  {
    question: "Có gì hay không",
    answer: "Đà Nẵng hay lắm! Tùy sở thích của bạn:\n\n- **Thiên nhiên**: Biển Mỹ Khê, Bán đảo Sơn Trà, Ngũ Hành Sơn\n- **Vui chơi**: Bà Nà Hills, Asia Park, Mikazuki Water Park\n- **Văn hóa**: Bảo tàng Chăm, Chùa Linh Ứng, Hội An\n- **Ẩm thực**: Mì Quảng, Hải sản, Cafe view biển\n- **Nightlife**: Sky36, Brilliant Bar, An Thượng\n\nBạn thích thể loại nào nhất?",
    keywords: "travel"
  },
  {
    question: "Giá cả như thế nào",
    answer: "Đà Nẵng giá cả phải chăng so với nhiều nơi:\n\n- **Ăn uống**: 30-50k/bữa (local), 150-300k (nhà hàng), 400-800k (buffet)\n- **Đi lại**: Grab 15-50k/cuốc, thuê xe máy 100k/ngày\n- **Khách sạn**: 200-400k (budget), 500k-1tr (3 sao), 1-3tr (4-5 sao)\n- **Tham quan**: Nhiều nơi FREE, có phí từ 40k-950k\n\nNgân sách bạn khoảng bao nhiêu/ngày? Mình tư vấn cụ thể!",
    keywords: "practical"
  },
  {
    question: "Lịch trình 1 ngày",
    answer: "Gợi ý 1 ngày khám phá Đà Nẵng:\n\n- **6:00-8:00**: Ăn sáng Mì Quảng + cafe\n- **8:30-11:30**: Ngũ Hành Sơn hoặc Sơn Trà\n- **12:00-13:30**: Ăn trưa hải sản\n- **14:00-17:00**: Biển Mỹ Khê tắm + nghỉ\n- **17:30-19:00**: Cafe hoàng hôn view biển\n- **19:00-21:00**: Ăn tối + dạo Cầu Rồng (T7/CN xem phun lửa)\n- **21:00+**: Bar hoặc về nghỉ\n\nMuốn mình customize theo sở thích bạn không?",
    keywords: "travel"
  },
  {
    question: "Lịch trình 3 ngày",
    answer: "Lịch 3 ngày Đà Nẵng đầy đủ:\n\n**Ngày 1 - Biển & Thành phố**\n- Sáng: Biển Mỹ Khê\n- Trưa: Mì Quảng\n- Chiều: Chợ Hàn, Nhà thờ Con Gà\n- Tối: Cầu Rồng, An Thượng\n\n**Ngày 2 - Bà Nà Hills**\n- Cả ngày: Bà Nà, Cầu Vàng\n- Tối: Asia Park\n\n**Ngày 3 - Văn hóa**\n- Sáng: Ngũ Hành Sơn\n- Chiều: Bảo tàng Chăm\n- Tối: Hội An\n\nBạn muốn thêm/bớt gì không?",
    keywords: "travel"
  },
  {
    question: "Đi một mình có vui không",
    answer: "Solo trip Đà Nẵng rất phù hợp! Lý do:\n\n- **An toàn**: Thành phố an ninh, người dân thân thiện\n- **Dễ kết bạn**: Khu An Thượng nhiều backpacker\n- **Linh hoạt**: Muốn đi đâu thì đi\n- **Tiết kiệm**: Thuê xe máy, ăn local\n\n**Tips solo**:\n- Ở hostel để gặp bạn mới\n- Join tour group (Bà Nà, Cù Lao Chàm)\n- Check-in quán cafe, bar - dễ bắt chuyện\n- Share taxi với bạn mới quen\n\nBạn là nam hay nữ? Mình có tips riêng!",
    keywords: "travel"
  },
  {
    question: "Đi với gia đình thì sao",
    answer: "Đà Nẵng cực kỳ phù hợp gia đình:\n\n**Cho trẻ em**:\n- Asia Park: vui chơi cả ngày\n- Bà Nà Hills: núi mát, nhiều game\n- Biển Mỹ Khê: nước cạn, sóng nhẹ\n- Mikazuki Water Park\n\n**Cho người lớn tuổi**:\n- Chùa Linh Ứng: tâm linh, view đẹp\n- Ngũ Hành Sơn: có thang máy\n- Spa massage: thư giãn\n\n**Tips**:\n- Book khách sạn có hồ bơi\n- Đi Grab thay xe máy\n- Ăn sớm (17-18h) tránh đông\n- Mang thuốc dự phòng\n\nGia đình bạn có mấy người? Có trẻ nhỏ/người lớn tuổi không?",
    keywords: "family"
  },
  {
    question: "Không biết đi đâu",
    answer: "Không sao! Mình giúp bạn chọn dựa trên:\n\n**Bạn thích gì?**\n1. Biển, nắng, thư giãn → Mỹ Khê, Sơn Trà\n2. Khám phá, leo núi → Ngũ Hành Sơn, Bà Nà\n3. Ăn uống, local food → Chợ Hàn, An Thượng\n4. Check-in, sống ảo → Cầu Vàng, Cầu Rồng\n5. Văn hóa, lịch sử → Bảo tàng, Hội An\n6. Vui chơi, giải trí → Asia Park, Helio\n\n**Hoặc cho mình biết:**\n- Ngân sách?\n- Đi mấy người?\n- Thời gian có?\n\nMình sẽ gợi ý ngay!",
    keywords: "travel"
  },
  {
    question: "Quá đắt",
    answer: "Hiểu rồi! Mình gợi ý tiết kiệm hơn:\n\n**Thay thế rẻ hơn**:\n- Bà Nà (950k) → Ngũ Hành Sơn (40k) view cũng đẹp\n- Buffet (500k) → Quán local (50k) ngon không kém\n- Taxi (100k) → Grab Bike (25k) nhanh hơn\n- Resort (2tr) → Hostel (150k) sạch sẽ\n\n**Địa điểm FREE**:\n- Biển Mỹ Khê\n- Cầu Rồng, Cầu Tình Yêu\n- Chợ Hàn (dạo chơi)\n- Công viên APEC\n\nNgân sách bạn khoảng bao nhiêu/ngày? Mình plan lại!",
    keywords: "practical"
  },
  {
    question: "Muốn đổi lịch trình",
    answer: "Được chứ! Bạn muốn thay đổi gì:\n\n1. **Thêm địa điểm** - Nói tên hoặc loại (biển, núi, ẩm thực...)\n2. **Bỏ địa điểm** - Chỗ nào bạn không thích?\n3. **Đổi thời gian** - Muốn đi sáng/chiều/tối?\n4. **Đổi ngày** - Hoán đổi hoạt động giữa các ngày?\n5. **Tăng/giảm ngân sách**\n\nCứ nói mình điều chỉnh ngay!",
    keywords: "general"
  },
  {
    question: "Có bão không",
    answer: "Mùa bão Đà Nẵng từ tháng 9-11:\n\n**Cách check**:\n- App: Windy, Weather.com\n- Tin tức: VTV, báo Đà Nẵng\n- Hotline: 1900.6060\n\n**Nếu có bão**:\n- Tránh ra biển, đèo\n- Ở trong khách sạn\n- Có kế hoạch B: bảo tàng, spa, mall\n- Liên hệ khách sạn hỗ trợ\n\n**Nếu bão nhẹ**:\n- Có thể đi Bà Nà (trong nhà)\n- Shopping Vincom, Lotte\n- Ăn uống, cafe\n\nBạn đi tháng mấy? Mình check thời tiết cho!",
    keywords: "weather"
  },
  {
    question: "Nên đi mùa nào",
    answer: "Mùa tốt nhất đi Đà Nẵng:\n\n**Tháng 3-5** (Xuân) ⭐⭐⭐⭐⭐\n- Nắng đẹp, ít mưa\n- Biển êm, tắm thoải mái\n- Chưa quá đông\n\n**Tháng 6-8** (Hè) ⭐⭐⭐⭐\n- Nắng nóng, biển đẹp nhất\n- Đông du khách, giá cao hơn\n\n**Tháng 9-11** (Thu) ⭐⭐⭐\n- Hay mưa, có bão\n- Giá rẻ, vắng người\n\n**Tháng 12-2** (Đông) ⭐⭐⭐⭐\n- Mát mẻ, ít mưa\n- Lễ hội, không khí vui\n\nBạn thích nóng hay mát? Du lịch biển hay núi?",
    keywords: "weather"
  },
  {
    question: "Có gì mới",
    answer: "Tin mới Đà Nẵng 2024:\n\n**Địa điểm mới**:\n- Sun World cập nhật Cầu Vàng\n- Cocobay hoạt động trở lại\n- Nhiều resort mới ven biển\n\n**Sự kiện hot**:\n- Lễ hội pháo hoa quốc tế (tháng 6-7)\n- Đà Nẵng Marathon\n- Festival biển\n\n**Tips 2024**:\n- Giá vé Bà Nà ~750k\n- Grab/Xanh SM phổ biến hơn\n- Nhiều cafe mới ở An Thượng\n\nBạn quan tâm sự kiện hay địa điểm mới?",
    keywords: "travel"
  },
  {
    question: "Mưa to quá",
    answer: "Mưa rồi à? Đừng lo, có nhiều chỗ chơi:\n\n**Giải trí trong nhà**:\n- Helio Center: bowling, game\n- Vincom: shopping, cinema\n- Bà Nà Hills: khu Fantasy Park trong nhà\n\n**Văn hóa**:\n- Bảo tàng Chăm (60k)\n- Bảo tàng 3D (200k)\n\n**Thư giãn**:\n- Spa massage\n- Cafe đọc sách\n- Buffet lẩu nướng ấm bụng\n\nMưa Đà Nẵng thường 30-60 phút là tạnh. Đợi trong quán cafe rồi đi tiếp nhé!",
    keywords: "weather"
  },
  {
    question: "Tip cho tài xế bao nhiêu",
    answer: "Văn hóa tip ở Việt Nam:\n\n**Grab/Taxi**: Không bắt buộc, làm tròn số là đủ\n- VD: 87k → đưa 90k, không cần thối\n\n**Nhà hàng**: 5-10% nếu service tốt\n- Buffet: không cần\n- Fine dining: 5-10%\n\n**Spa/Massage**: 50-100k nếu hài lòng\n\n**Tour guide**: 100-200k/ngày\n\n**Khách sạn**:\n- Bellboy: 20-50k/vali\n- Housekeeping: 20-50k/ngày\n\n**Lưu ý**: Tip không bắt buộc ở VN, nhưng được đánh giá cao!",
    keywords: "practical"
  },
  {
    question: "Có cần visa không",
    answer: "Tùy quốc tịch của bạn:\n\n**Miễn visa** (15-30 ngày):\n- Đông Nam Á: ASEAN các nước\n- Châu Âu: Anh, Pháp, Đức, Ý, Tây Ban Nha...\n- Châu Á: Nhật, Hàn, Đài Loan\n- Khác: Mỹ, Úc (không quá 15 ngày)\n\n**Cần visa**:\n- Trung Quốc, Ấn Độ, nhiều nước khác\n\n**E-visa**: Làm online 3-5 ngày, 25 USD\n- Website: evisa.xuatnhapcanh.gov.vn\n\nBạn mang passport nước nào? Mình check cụ thể!",
    keywords: "practical"
  },
  {
    question: "Chụp ảnh đẹp ở đâu",
    answer: "Top spots sống ảo Đà Nẵng:\n\n**View biển**:\n- Bán đảo Sơn Trà: sunrise\n- Biển Mỹ Khê: hoàng hôn\n- Cầu Rồng: đêm lung linh\n\n**Kiến trúc**:\n- Cầu Vàng: icon nổi tiếng\n- Nhà thờ Con Gà: tông hồng\n- Bảo tàng Chăm: cổ kính\n\n**Thiên nhiên**:\n- Ngũ Hành Sơn: hang động\n- Đèo Hải Vân: road trip\n\n**Phố phường**:\n- Hội An: đèn lồng\n- An Thượng: phố Tây\n\nBạn thích style nào? Mình gợi ý góc chụp đẹp!",
    keywords: "travel"
  },
  {
    question: "Có nguy hiểm không",
    answer: "Đà Nẵng rất an toàn! Nhưng vẫn cần lưu ý:\n\n**An toàn cao**:\n- Tỷ lệ tội phạm thấp\n- Người dân thân thiện\n- Cảnh sát du lịch tuần tra\n\n**Cẩn thận**:\n- Móc túi ở chợ, nơi đông người\n- Chặt chém taxi (dùng Grab)\n- Lừa đảo ở sân bay\n- Đồ biển không tươi (chọn quán uy tín)\n\n**Hotline khẩn cấp**:\n- Cảnh sát: 113\n- Cấp cứu: 115\n- Du lịch: 0511.3550.111\n\nCứ yên tâm đi chơi nhé!",
    keywords: "practical"
  },
  {
    question: "Tôi bị lạc",
    answer: "Đừng lo! Mình hướng dẫn:\n\n1. **Dùng Google Maps** - Bật GPS, tìm vị trí hiện tại\n\n2. **Gọi Grab** - Đặt xe về khách sạn/điểm quen\n\n3. **Hỏi người địa phương** - Nói: \"Cho tôi hỏi đường đến...\" (chỉ tên địa điểm)\n\n4. **Tìm địa điểm dễ nhận**:\n- Cầu Rồng, Cầu Sông Hàn\n- Vincom, Lotte Mart\n- Bệnh viện, đồn công an\n\n5. **Liên hệ khách sạn** - Họ sẽ hướng dẫn hoặc gửi tài xế đón\n\nBạn đang ở đâu (nhìn xung quanh có gì)? Mình giúp định vị!",
    keywords: "practical"
  },
  {
    question: "Khách sạn nào tốt",
    answer: "Tùy ngân sách:\n\n**Budget (200-500k)**:\n- Funtastic Danang Hostel\n- Memory Hostel\n- 7S Hotel\n\n**Trung cấp (500k-1.2tr)**:\n- Grand Tourane Hotel ⭐⭐⭐⭐\n- Sala Danang Beach ⭐⭐⭐⭐\n- Alan Sea Hotel\n\n**Cao cấp (1.5-3tr)**:\n- Brilliant Hotel ⭐⭐⭐⭐⭐\n- Novotel ⭐⭐⭐⭐⭐\n- Premier Village\n\n**Luxury (3-10tr)**:\n- InterContinental Sơn Trà\n- Furama Resort\n- TIA Wellness\n\nNgân sách bạn bao nhiêu? Ở gần biển hay trung tâm?",
    keywords: "practical"
  },
  {
    question: "Đêm nay làm gì",
    answer: "Tối Đà Nẵng có nhiều hoạt động:\n\n**Chill nhẹ**:\n- Dạo Cầu Rồng, Cầu Tình Yêu\n- Cafe rooftop ngắm thành phố\n- Ăn hải sản ven biển\n\n**Năng động**:\n- Sky36 bar/club\n- Brilliant Top Bar\n- Pub crawl An Thượng\n\n**Đặc biệt (T7/CN)**:\n- Xem Cầu Rồng phun lửa 21:00\n\n**Văn hóa**:\n- Hội An về đêm (30 phút đi)\n- Chợ đêm Sơn Trà\n\nBạn thích chill hay party?",
    keywords: "entertainment"
  },
  {
    question: "Bạn giỏi thật",
    answer: "Cảm ơn bạn! Mình chỉ là AI được huấn luyện để hiểu về Đà Nẵng thôi.\n\nNếu có câu hỏi nào mình trả lời chưa đúng hoặc chưa đủ, cứ góp ý nhé. Mình sẽ cố gắng hữu ích hơn!\n\nCòn gì cần hỏi về chuyến đi không?",
    keywords: "general"
  },
  {
    question: "Bạn sai rồi",
    answer: "Xin lỗi bạn! Mình có thể sai vì:\n- Thông tin đã cũ (giá, giờ mở cửa thay đổi)\n- Mình hiểu sai câu hỏi\n- Dữ liệu mình có không đầy đủ\n\nBạn có thể cho mình biết sai ở đâu không? Mình sẽ:\n1. Sửa lại câu trả lời\n2. Ghi nhận để cải thiện\n\nCảm ơn bạn đã góp ý!",
    keywords: "general"
  },
  {
    question: "Wifi ở đâu mạnh",
    answer: "Wifi mạnh nhất ở Đà Nẵng:\n\n**Coworking** (50-200 Mbps):\n- Toong: 50k/giờ\n- Dreamplex: 150k/ngày\n\n**Cafe** (20-50 Mbps):\n- 43 Factory: tầng 2 vắng, net tốt\n- The Espresso Station: có ổ điện\n- Highlands Vincom: phòng riêng\n\n**Khách sạn 4-5 sao**: 50-100 Mbps\n\n**Tips**:\n- Hỏi mật khẩu wifi khi vào quán\n- Tránh giờ cao điểm (19-22h)\n- Mang sạc dự phòng\n\nBạn cần net để làm việc hay chỉ lướt web?",
    keywords: "practical"
  },
  {
    question: "Đồ ăn có cay không",
    answer: "Ẩm thực Đà Nẵng nhìn chung KHÔNG cay như miền Trung khác:\n\n**Món KHÔNG cay**:\n- Mì Quảng: ngọt thanh\n- Bún chả cá: nước dùng nhẹ\n- Bánh xèo: giòn, không cay\n- Hải sản: tùy cách chế biến\n\n**Món CÓ cay**:\n- Bún bò Huế: cay vừa\n- Mắm nêm: cay nhẹ\n- Ớt tươi: luôn có sẵn trên bàn\n\n**Tips**:\n- Nói \"Không cay\" khi order\n- Hỏi trước món nào có ớt\n- Mang thuốc dạ dày nếu nhạy cảm\n\nBạn ăn cay được không?",
    keywords: "food"
  },
  {
    question: "Ăn hải sản bị dị ứng thì sao",
    answer: "Nếu dị ứng hải sản, đừng lo:\n\n**Món thay thế ngon**:\n- Mì Quảng gà/bò\n- Bún bò Huế\n- Cơm gà, phở bò\n- Bánh mì thịt\n- Cơm chay\n\n**Khi order**:\n- Nói rõ: \"Tôi dị ứng hải sản\"\n- Kiểm tra nước mắm (có thể có tôm)\n- Tránh quán chuyên hải sản (cross-contamination)\n\n**Thuốc dự phòng**:\n- Mang theo antihistamine\n- Biết vị trí bệnh viện gần nhất\n\nBạn dị ứng loại nào cụ thể?",
    keywords: "food"
  },
  {
    question: "Có chỗ nào lãng mạn không",
    answer: "Đà Nẵng lãng mạn lắm nha:\n\n**Dinner romantic**:\n- La Maison 1888 (Bà Nà): fine dining trên mây\n- The Sailing Club: biển, hoàng hôn\n- Sky36: rooftop ngắm thành phố\n\n**Hoạt động couple**:\n- Du thuyền sông Hàn tối\n- Spa couple massage\n- Đạp xe dọc biển lúc bình minh\n- Sunset picnic bãi biển\n\n**Check-in đẹp đôi**:\n- Cầu Tình Yêu: treo khóa\n- Vườn hoa Bà Nà\n- Hội An đêm đèn lồng\n\nBạn đang kỷ niệm gì đặc biệt không?",
    keywords: "couples"
  },
  {
    question: "Tôi muốn propose",
    answer: "Wow, chúc mừng! Đà Nẵng là nơi tuyệt vời để cầu hôn:\n\n**Top spots**:\n1. **Cầu Vàng** - iconic, đông người nhưng đẹp\n2. **InterContinental Sơn Trà** - private, sunset\n3. **Du thuyền sông Hàn** - lãng mạn, riêng tư\n4. **Rooftop Brilliant** - view 360°\n5. **Hội An đêm** - đèn lồng, thơ mộng\n\n**Tips**:\n- Book nhà hàng private nếu cần\n- Thuê photographer ghi lại khoảnh khắc\n- Check thời tiết trước\n- Chuẩn bị plan B nếu mưa\n\nMình có thể giúp bạn lên kế hoạch chi tiết!",
    keywords: "couples"
  },
  // === THÊM MỚI: PHÂN TÍCH LỊCH TRÌNH ===
  {
    question: "Phân tích lịch trình của tôi",
    answer: "Để mình xem qua lịch trình của bạn nhé!\n\nMình sẽ phân tích:\n- Tổng quan các hoạt động theo ngày\n- Sự cân bằng giữa tham quan, ăn uống, nghỉ ngơi\n- Thời gian di chuyển có hợp lý không\n- Ngân sách phân bổ ra sao\n- Các điểm mạnh và gợi ý cải thiện\n\nBạn có thể hỏi mình chi tiết về bất kỳ ngày nào nhé!",
    keywords: "itinerary"
  },
  {
    question: "Lịch trình của tôi",
    answer: "Mình đang xem lịch trình của bạn đây! Để mình tóm tắt những điểm nổi bật:\n\n- Các địa điểm bạn sẽ ghé thăm\n- Thời gian dự kiến cho mỗi hoạt động\n- Chi phí ước tính\n\nBạn có muốn mình đánh giá chi tiết hơn, hoặc gợi ý thêm địa điểm phù hợp không?",
    keywords: "itinerary"
  },
  {
    question: "Mô tả lịch trình",
    answer: "Để mình kể cho bạn nghe về hành trình sắp tới nhé!\n\nMình sẽ mô tả chi tiết:\n- Bắt đầu từ đâu, kết thúc ở đâu\n- Highlight của mỗi ngày\n- Những trải nghiệm đặc biệt bạn sẽ có\n\nSau đó bạn có thể điều chỉnh nếu muốn thêm/bớt gì đó!",
    keywords: "itinerary"
  },
  {
    question: "Đánh giá lịch trình",
    answer: "Mình sẽ đánh giá lịch trình của bạn dựa trên:\n\n**Tiêu chí**:\n1. Sự hợp lý về thời gian di chuyển\n2. Cân bằng giữa các loại hoạt động\n3. Phù hợp với ngân sách\n4. Phù hợp với sở thích đã chọn\n5. Có đủ thời gian nghỉ ngơi\n\nSau khi đánh giá, mình sẽ gợi ý cải thiện nếu cần. Bạn sẵn sàng chưa?",
    keywords: "itinerary"
  },
  {
    question: "Hôm nay đi đâu",
    answer: "Để mình xem lịch trình ngày hôm nay của bạn nhé!\n\nMình sẽ cho bạn biết:\n- Các điểm cần ghé\n- Thời gian nên đến mỗi nơi\n- Cách di chuyển giữa các điểm\n- Gợi ý ăn trưa/tối gần đó\n\nNếu có thay đổi kế hoạch đột xuất (thời tiết, sở thích), cứ nói mình điều chỉnh nhé!",
    keywords: "itinerary"
  },
  {
    question: "Ngày mai đi đâu",
    answer: "Mình check lịch ngày mai cho bạn nhé!\n\nSẽ gồm:\n- Danh sách địa điểm theo thứ tự\n- Thời gian gợi ý cho mỗi nơi\n- Tips để trải nghiệm tốt nhất\n\nBạn có kế hoạch thay đổi gì không? Mình có thể điều chỉnh linh hoạt!",
    keywords: "itinerary"
  },
  {
    question: "Tổng chi phí bao nhiêu",
    answer: "Để mình tính toán chi phí lịch trình cho bạn:\n\n**Bao gồm**:\n- Vé tham quan các điểm\n- Chi phí ăn uống ước tính\n- Chi phí di chuyển\n- Chi phí phát sinh (thuê đồ, tip...)\n\n**Chưa bao gồm**:\n- Khách sạn (nếu bạn đã đặt riêng)\n- Mua sắm, quà lưu niệm\n\nMình sẽ cho bạn con số tổng và so sánh với ngân sách ban đầu nhé!",
    keywords: "itinerary"
  },
  {
    question: "Lịch trình có ổn không",
    answer: "Để mình review lịch trình của bạn với con mắt của người địa phương nhé!\n\nMình sẽ check:\n- Thời gian có đủ cho mỗi nơi không\n- Khoảng cách di chuyển có xa quá không\n- Giờ mở cửa các điểm có khớp không\n- Có bỏ sót điểm hay ho nào không\n\nNếu có gì cần sửa, mình sẽ gợi ý ngay!",
    keywords: "itinerary"
  },
  {
    question: "Thiếu gì không",
    answer: "Mình sẽ check xem lịch trình còn thiếu gì nhé!\n\n**Có thể bị thiếu**:\n- Địa điểm nổi tiếng (Cầu Vàng, Biển, Chợ Hàn...)\n- Trải nghiệm ẩm thực đặc sản\n- Thời gian nghỉ ngơi, thư giãn\n- Hoạt động tối/đêm\n- Mua quà lưu niệm\n\nDựa trên sở thích của bạn, mình sẽ gợi ý những gì nên thêm vào!",
    keywords: "itinerary"
  },
  {
    question: "Nên bỏ gì",
    answer: "Mình xem có gì nên bỏ hoặc thay thế không nhé!\n\n**Lý do có thể bỏ**:\n- Địa điểm xa, mất nhiều thời gian đi\n- Không phù hợp sở thích của bạn\n- Giá vé cao so với trải nghiệm\n- Trùng lặp với địa điểm khác (VD: 2 bảo tàng liên tiếp)\n\nMình sẽ gợi ý alternatives nếu bỏ địa điểm nào!",
    keywords: "itinerary"
  },
  {
    question: "Xem lại lịch trình",
    answer: "Mình hiển thị lại toàn bộ lịch trình cho bạn nhé!\n\nBạn muốn:\n1. Xem tổng quan cả chuyến đi?\n2. Xem chi tiết từng ngày?\n3. Xem chi phí dự kiến?\n4. So sánh với ngân sách?\n\nCứ nói mình biết bạn quan tâm điều gì nhất!",
    keywords: "itinerary"
  },
  {
    question: "Tóm tắt chuyến đi",
    answer: "Đây là bản tóm tắt chuyến đi Đà Nẵng của bạn:\n\nMình sẽ highlight:\n- Tổng số ngày và hoạt động\n- Top địa điểm không thể bỏ qua\n- Món ăn phải thử\n- Tổng chi phí dự kiến\n- Vài tips quan trọng\n\nBạn có muốn mình in ra hoặc gửi qua email không?",
    keywords: "itinerary"
  }
];



// ==========================================
// 3. MAIN SEED FUNCTION
// ==========================================
async function main() {
  console.log('🚀 Bắt đầu khởi tạo dữ liệu mẫu (Seeding)...\n');

  try {
    // 1. Xóa dữ liệu cũ
    console.log('Cleaning old data...');
    await prisma.knowledge.deleteMany();
    await prisma.location.deleteMany();
    await prisma.transport.deleteMany(); // Clean transport data
    // await prisma.admin.deleteMany(); // Giữ lại admin nếu muốn
    console.log('✅ Cleaned old data\n');

    // 2. Tạo Admin
    console.log('Creating Admin...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        passwordHash: adminPassword,
        email: 'admin@danatravel.com',
        role: 'admin',
        active: true
      }
    });
    console.log('✅ Created Admin: admin / admin123\n');

    // 3. Seed Knowledge Base
    console.log('Seeding Knowledge Base...');
    let knowledgeCount = 0;
    for (const kb of knowledgeData) {
      await prisma.knowledge.create({
        data: {
          question: kb.question,
          answer: kb.answer,
          keywords: kb.keywords,
        },
      });
      knowledgeCount++;
    }
    console.log(`✅ Seeded ${knowledgeCount} knowledge entries\n`);

    // 4. Seed Locations
    console.log('Seeding Locations...');
    let locationCount = 0;
    for (const loc of realLocations) {
      await prisma.location.create({
        data: {
          id: loc.id, // Use generated ID
          name: loc.name,
          type: loc.type,
          area: "Đà Nẵng", // Default
          address: loc.address,
          lat: loc.lat,
          lng: loc.lng,
          ticket: loc.ticket,
          priceLevel: loc.priceLevel,
          description: loc.description,
          tags: JSON.stringify(loc.tags),
          indoor: false, // Default
          openTime: loc.operatingHours ? `${loc.operatingHours.start}:00` : "00:00",
          closeTime: loc.operatingHours ? `${loc.operatingHours.end}:00` : "24:00",
          suggestedDuration: 90, // Default 90 mins
          visitType: loc.visitType,
          menu: JSON.stringify([
            { name: "Chi phí ăn uống trung bình", price: loc.food || 0 },
            { name: "Chi phí phát sinh", price: loc.extra || 0 }
          ])
        }
      });
      locationCount++;
      console.log(`Created: [${loc.id}] ${loc.name}`);
    }
    console.log(`✅ Seeded ${locationCount} locations\n`);

    // 5. Seed Transport
    console.log('Seeding Transport...');
    let transportCount = 0;
    for (const trans of transport) {
      await prisma.transport.create({
        data: {
          name: trans.name,
          type: trans.type,
          basePrice: trans.basePrice,
          pricePerKm: trans.pricePerKm,
          description: trans.description
        }
      });
      transportCount++;
      console.log(`Created Transport: ${trans.name}`);
    }
    console.log(`✅ Seeded ${transportCount} transport options\n`);

    console.log('🎉 Seeding completed successfully!');
  } catch (e) {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
