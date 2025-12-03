import { PrismaClient } from '@prisma/client';
import { locations } from './data/locations.js';

const prisma = new PrismaClient();

// ==========================================
// KNOWLEDGE BASE - 50+ Q&A Entries
// ==========================================
const knowledgeData = [
  // ========== DANH MỤC DU LỊCH (20 entries) ==========
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
    answer: "Hội An cách Đà Nẵng khoảng **30km**, đi mất tầm 40-50 phút tùy phương tiện:\n\n- **Taxi / Grab Car**: ~200.000-250.000đ một chiều\n- **Xe máy thuê**: 80.000-120.000đ/ngày (tự lái)\n- **Xe buýt số 1**: Chỉ 20.000đ nhưng mất 60-90 phút\n\nMình gợi ý thuê xe máy nếu bạn muốn linh hoạt khám phá nhé! Mùa nào đi cũng đẹp, nhưng đẹp nhất là tối khi lồng đèn bừng sáng!",
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
  
  // ========== DANH MỤC ẨM THỰC (15 entries) ==========
  {
    question: "Quán hải sản tươi sống ở đâu ngon?",
    answer: "Top 3 quán hải sản được local khen nức nở:\n\n1. **Bé Mặn** (⭐ 4.8/5)\n- Hải sản tươi roi rói, giá hợp lý\n- Nổi tiếng: Ốc hương rang me, nghêu hấp xả\n- Giá: 200-400k/người\n- Địa chỉ: Võ Văn Kiệt (gần biển)\n\n2. **Cá Tầm**\n- Chuyên cá tầm size khủng\n- View biển cực chill\n- Giá: 300-500k/người\n\n3. **Hải Sản Thần Phù**\n- Bình dân hơn, đông khách local\n- Giá: 150-250k/người\n\nBạn đi mấy người? Mình gợi ý món order cho vừa vặn!",
    keywords: "food"
  },
  {
    question: "Bún chá cá nổi tiếng nhất ở đâu?",
    answer: "Có 2 quán bún chá cá siêu ĐỈNH:\n\n1. **Bún Chả Cá 82 Phan Châu Trinh** (Quán gốc)⭐ 4.9/5\n- Được coi là \"nguyên tổ\" bún chá cá Đà Nẵng\n- Chả cá chiên giòn tan, nước dùng ngọt thanh\n- Giá: 35.000đ/tô\n- Tip: Đến trước 11h để không phải xếp hàng!\n\n2. **Bún Chả Cá Nguyễn Tri Phương**\n- Nước dùng đậm đà hơn\n- Nhiều topping hơn\n- Giá: 40.000đ/tô\n\nMình thích quán 82 hơn vì authentic và đúng vị! Bạn muốn thêm vào lịch trình không?",
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
    answer: "Top 3 buffet hải sản Đà Nẵng:\n\n1. **Paramount Buffet** (Brilliant Hotel)\n- Hải sản tươi sống: tôm hùm, cua king, sò điệp\n- Hơn 100 món\n- Giá: 599k-799k/người (tùy ngày)\n- Booking: 0236.3888.888\n\n2. **New Cham Buffet** (4.5/5⭐)\n- Buffet lẩu hải sản + nướng\n- Unlimited cua, tôm, mực\n- Giá: 399k-499k/người\n\n3. **BBQ Garden** (Hyatt Regency)\n- Sang trọng nhất\n- BBQ + hải sản\n- Giá: 899k-1.2tr/người\n\nNgân sách của bạn bao nhiêu? Mình sẽ recommend phù hợp nhất!",
    keywords: "food"
  },
  {
    question: "Quán ăn vặt tối ở đâu?",
    answer: "Đà Nẵng ăn vặt tối cực thơm:\n\n- **Hàng Gốc Đại Lộ (Phan Đăng Lưu)**\n- Bánh tráng cuốn thịt heo\n- Nem lụi nướng\n- 20-30k/phần\n- Đông nhất 18:00-22:00\n\n- **Chợ Cồn** (Chợ đêm)\n- Cả khu ăn vặt:\n- Bánh bèo, bánh ít, ra m\n- Chè, trà sữa\n- 15-40k/món\n\n- **Khu Ăn Vặt Châu Thị Tế**\n- Gà nướng lu, chân gà sả\n- Giá rẻ, đông sinh viên\n- 25-50k\n\n- **Nướng BBQ đường Trần Phú**\n- Xiên nướng, nem nướng\n- Vỉa hè, vibe local\n- 5-10k/xiên\n\nBạn ở gần đâu? Mình chỉ quán gần nhất!",
    keywords: "food"
  },
  
  // ========== DANH MỤC THỰC TẾ (15 entries) ==========
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
  
  // ... Continue with more entries to reach 50+
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
  }
];

async function main() {
  console.log('🌱 Start seeding...\n');

  try {
    // 1. Xóa dữ liệu cũ
    console.log('🗑️  Deleting old data...');
    await prisma.knowledge.deleteMany();
    await prisma.location.deleteMany();
    console.log('✅ Deleted old data\n');

    // 1.5 Seed Admin
    console.log('👤 Seeding Admin...');
    const adminPassword = await import('bcryptjs').then(m => m.hash('admin123', 10));
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
    console.log('✅ Seeded admin account: admin / admin123\n');

    // 2. Seed Knowledge Base
    console.log('📚 Seeding Knowledge Base...');
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

    // 3. Seed Locations
    console.log('📍 Seeding Locations...');
    let locationCount = 0;
    for (const loc of locations) {
      // Handle tags: ensure it's a string (JSON)
      let tagsString = '[]';
      if (Array.isArray(loc.tags)) {
        tagsString = JSON.stringify(loc.tags);
      } else if (typeof loc.tags === 'string') {
        tagsString = loc.tags;
      }

      // Handle menu: ensure it's a string (JSON)
      let menuString = null;
      if (loc.menu) {
          if (typeof loc.menu === 'object') {
              menuString = JSON.stringify(loc.menu);
          } else {
              menuString = loc.menu;
          }
      }

      await prisma.location.create({
        data: {
          id: loc.id,
          name: loc.name,
          type: loc.type,
          area: loc.area,
          address: loc.address,
          lat: loc.lat,
          lng: loc.lng,
          ticket: loc.ticket || 0,
          indoor: loc.indoor || false,
          priceLevel: loc.priceLevel,
          tags: tagsString,
          suggestedDuration: loc.suggestedDuration,
          menu: menuString,
          description: loc.description,
        },
      });
      locationCount++;
    }
    console.log(`✅ Seeded ${locationCount} locations\n`);

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


