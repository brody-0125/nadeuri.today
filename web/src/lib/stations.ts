import { StationMeta } from '@/types';
import { getChosung, isChosungOnly } from '@/lib/hangul';

const _RAW_STATIONS: StationMeta[] = [
  // ── 1호선 ──
  { code: '0150', name: '서울역', lines: ['1', '4'], lat: 37.5547, lng: 126.9707 },
  { code: '0151', name: '시청', lines: ['1', '2'], lat: 37.5657, lng: 126.9770 },
  { code: '0152', name: '종각', lines: ['1'], lat: 37.5700, lng: 126.9828 },
  { code: '0153', name: '종로3가', lines: ['1', '3', '5'], lat: 37.5716, lng: 126.9920 },
  { code: '0154', name: '종로5가', lines: ['1'], lat: 37.5707, lng: 126.9985 },
  { code: '0155', name: '동대문', lines: ['1', '4'], lat: 37.5712, lng: 127.0095 },
  { code: '0156', name: '신설동', lines: ['1', '2'], lat: 37.5757, lng: 127.0251 },
  { code: '0157', name: '제기동', lines: ['1'], lat: 37.5787, lng: 127.0349 },
  { code: '0158', name: '청량리', lines: ['1'], lat: 37.5805, lng: 127.0469 },
  { code: '0159', name: '회기', lines: ['1'], lat: 37.5898, lng: 127.0580 },
  { code: '0160', name: '외대앞', lines: ['1'], lat: 37.5943, lng: 127.0597 },
  { code: '0161', name: '신이문', lines: ['1'], lat: 37.5962, lng: 127.0664 },
  { code: '0162', name: '석계', lines: ['1', '6'], lat: 37.6147, lng: 127.0657 },
  { code: '0163', name: '광운대', lines: ['1'], lat: 37.6218, lng: 127.0621 },
  { code: '0164', name: '월계', lines: ['1'], lat: 37.6271, lng: 127.0590 },
  { code: '0165', name: '녹천', lines: ['1'], lat: 37.6351, lng: 127.0555 },
  { code: '0166', name: '창동', lines: ['1', '4'], lat: 37.6533, lng: 127.0477 },
  { code: '0167', name: '방학', lines: ['1'], lat: 37.6587, lng: 127.0437 },
  { code: '0168', name: '도봉', lines: ['1'], lat: 37.6658, lng: 127.0357 },
  { code: '0169', name: '도봉산', lines: ['1', '7'], lat: 37.6717, lng: 127.0319 },
  { code: '0170', name: '망월사', lines: ['1'], lat: 37.6803, lng: 127.0299 },
  { code: '0171', name: '회룡', lines: ['1'], lat: 37.6885, lng: 127.0331 },
  { code: '0172', name: '의정부', lines: ['1'], lat: 37.7378, lng: 127.0458 },
  { code: '0140', name: '남영', lines: ['1'], lat: 37.5414, lng: 126.9715 },
  { code: '0141', name: '용산', lines: ['1'], lat: 37.5299, lng: 126.9647 },
  { code: '0142', name: '노량진', lines: ['1', '9'], lat: 37.5135, lng: 126.9425 },
  { code: '0143', name: '대방', lines: ['1'], lat: 37.5132, lng: 126.9267 },
  { code: '0144', name: '신길', lines: ['1', '5'], lat: 37.5170, lng: 126.9164 },
  { code: '0145', name: '영등포', lines: ['1'], lat: 37.5158, lng: 126.9073 },
  { code: '0146', name: '신도림', lines: ['1', '2'], lat: 37.5089, lng: 126.8914 },
  { code: '0147', name: '구로', lines: ['1'], lat: 37.5031, lng: 126.8825 },
  { code: '0148', name: '구일', lines: ['1'], lat: 37.4936, lng: 126.8548 },
  { code: '0149', name: '개봉', lines: ['1'], lat: 37.4938, lng: 126.8564 },

  // ── 2호선 ──
  { code: '0201', name: '을지로입구', lines: ['2'], lat: 37.5660, lng: 126.9825 },
  { code: '0202', name: '을지로4가', lines: ['2', '5'], lat: 37.5668, lng: 127.0000 },
  { code: '0203', name: '을지로3가', lines: ['2', '3'], lat: 37.5663, lng: 126.9920 },
  { code: '0204', name: '동대문역사문화공원', lines: ['2', '4', '5'], lat: 37.5652, lng: 127.0094 },
  { code: '0205', name: '신당', lines: ['2', '6'], lat: 37.5659, lng: 127.0173 },
  { code: '0206', name: '상왕십리', lines: ['2'], lat: 37.5645, lng: 127.0290 },
  { code: '0207', name: '왕십리', lines: ['2', '5'], lat: 37.5614, lng: 127.0388 },
  { code: '0208', name: '한양대', lines: ['2'], lat: 37.5566, lng: 127.0438 },
  { code: '0209', name: '뚝섬', lines: ['2'], lat: 37.5473, lng: 127.0469 },
  { code: '0210', name: '성수', lines: ['2'], lat: 37.5445, lng: 127.0558 },
  { code: '0211', name: '용답', lines: ['2'], lat: 37.5649, lng: 127.0574 },
  { code: '0212', name: '건대입구', lines: ['2', '7'], lat: 37.5403, lng: 127.0694 },
  { code: '0213', name: '구의', lines: ['2'], lat: 37.5387, lng: 127.0862 },
  { code: '0214', name: '강변', lines: ['2'], lat: 37.5350, lng: 127.0943 },
  { code: '0215', name: '잠실나루', lines: ['2'], lat: 37.5211, lng: 127.1030 },
  { code: '0216', name: '잠실', lines: ['2', '8'], lat: 37.5133, lng: 127.1001 },
  { code: '0217', name: '잠실새내', lines: ['2'], lat: 37.5119, lng: 127.0866 },
  { code: '0218', name: '종합운동장', lines: ['2', '9'], lat: 37.5111, lng: 127.0738 },
  { code: '0219', name: '삼성', lines: ['2'], lat: 37.5089, lng: 127.0637 },
  { code: '0220', name: '선릉', lines: ['2'], lat: 37.5045, lng: 127.0490 },
  { code: '0221', name: '역삼', lines: ['2'], lat: 37.5007, lng: 127.0365 },
  { code: '0222', name: '강남', lines: ['2'], lat: 37.4979, lng: 127.0276 },
  { code: '0223', name: '교대', lines: ['2', '3'], lat: 37.4934, lng: 127.0145 },
  { code: '0224', name: '서초', lines: ['2'], lat: 37.4918, lng: 127.0078 },
  { code: '0225', name: '방배', lines: ['2'], lat: 37.4814, lng: 126.9977 },
  { code: '0226', name: '사당', lines: ['2', '4'], lat: 37.4765, lng: 126.9816 },
  { code: '0227', name: '낙성대', lines: ['2'], lat: 37.4770, lng: 126.9632 },
  { code: '0228', name: '서울대입구', lines: ['2'], lat: 37.4816, lng: 126.9527 },
  { code: '0229', name: '신림', lines: ['2'], lat: 37.4842, lng: 126.9294 },
  { code: '0230', name: '봉천', lines: ['2'], lat: 37.4829, lng: 126.9417 },
  { code: '0231', name: '대림', lines: ['2', '7'], lat: 37.4922, lng: 126.8992 },
  { code: '0232', name: '구로디지털단지', lines: ['2'], lat: 37.4851, lng: 126.9015 },
  { code: '0233', name: '신대방', lines: ['2'], lat: 37.4878, lng: 126.9134 },
  { code: '0234', name: '신대방삼거리', lines: ['2'], lat: 37.4893, lng: 126.9192 },
  { code: '0235', name: '문래', lines: ['2'], lat: 37.5176, lng: 126.8984 },
  { code: '0236', name: '영등포구청', lines: ['2', '5'], lat: 37.5240, lng: 126.8963 },
  { code: '0237', name: '당산', lines: ['2', '9'], lat: 37.5339, lng: 126.9023 },
  { code: '0238', name: '합정', lines: ['2', '6'], lat: 37.5495, lng: 126.9137 },
  { code: '0239', name: '홍대입구', lines: ['2'], lat: 37.5571, lng: 126.9236 },
  { code: '0240', name: '신촌', lines: ['2'], lat: 37.5553, lng: 126.9366 },
  { code: '0241', name: '이대', lines: ['2'], lat: 37.5569, lng: 126.9458 },
  { code: '0242', name: '아현', lines: ['2'], lat: 37.5576, lng: 126.9560 },
  { code: '0243', name: '충정로', lines: ['2', '5'], lat: 37.5601, lng: 126.9636 },

  // ── 3호선 ──
  { code: '0309', name: '경복궁', lines: ['3'], lat: 37.5759, lng: 126.9736 },
  { code: '0310', name: '안국', lines: ['3'], lat: 37.5765, lng: 126.9852 },
  { code: '0312', name: '동대입구', lines: ['3'], lat: 37.5581, lng: 127.0070 },
  { code: '0313', name: '약수', lines: ['3', '6'], lat: 37.5545, lng: 127.0103 },
  { code: '0314', name: '금호', lines: ['3'], lat: 37.5476, lng: 127.0133 },
  { code: '0315', name: '옥수', lines: ['3'], lat: 37.5406, lng: 127.0178 },
  { code: '0316', name: '압구정', lines: ['3'], lat: 37.5268, lng: 127.0283 },
  { code: '0317', name: '신사', lines: ['3'], lat: 37.5164, lng: 127.0202 },
  { code: '0318', name: '잠원', lines: ['3'], lat: 37.5117, lng: 127.0156 },
  { code: '0319', name: '고속터미널', lines: ['3', '7', '9'], lat: 37.5049, lng: 127.0049 },
  { code: '0320', name: '양재', lines: ['3'], lat: 37.4842, lng: 127.0346 },
  { code: '0321', name: '매봉', lines: ['3'], lat: 37.4801, lng: 127.0472 },
  { code: '0322', name: '도곡', lines: ['3'], lat: 37.4827, lng: 127.0572 },
  { code: '0323', name: '대치', lines: ['3'], lat: 37.4952, lng: 127.0623 },
  { code: '0324', name: '학여울', lines: ['3'], lat: 37.4966, lng: 127.0710 },
  { code: '0325', name: '대청', lines: ['3'], lat: 37.4921, lng: 127.0830 },
  { code: '0326', name: '일원', lines: ['3'], lat: 37.4835, lng: 127.0879 },
  { code: '0327', name: '수서', lines: ['3'], lat: 37.4872, lng: 127.1019 },
  { code: '0328', name: '가락시장', lines: ['3', '8'], lat: 37.4926, lng: 127.1183 },
  { code: '0329', name: '경찰병원', lines: ['3'], lat: 37.4965, lng: 127.1250 },
  { code: '0330', name: '오금', lines: ['3', '5'], lat: 37.5018, lng: 127.1284 },
  { code: '0331', name: '충무로', lines: ['3', '4'], lat: 37.5614, lng: 126.9946 },
  { code: '0306', name: '연신내', lines: ['3', '6'], lat: 37.6190, lng: 126.9214 },
  { code: '0307', name: '불광', lines: ['3', '6'], lat: 37.6100, lng: 126.9298 },
  { code: '0308', name: '독립문', lines: ['3'], lat: 37.5726, lng: 126.9607 },

  // ── 4호선 ──
  { code: '0409', name: '노원', lines: ['4'], lat: 37.6544, lng: 127.0614 },
  { code: '0410', name: '쌍문', lines: ['4'], lat: 37.6482, lng: 127.0347 },
  { code: '0411', name: '수유', lines: ['4'], lat: 37.6382, lng: 127.0253 },
  { code: '0412', name: '미아', lines: ['4'], lat: 37.6266, lng: 127.0265 },
  { code: '0413', name: '미아사거리', lines: ['4'], lat: 37.6133, lng: 127.0300 },
  { code: '0414', name: '길음', lines: ['4'], lat: 37.6032, lng: 127.0255 },
  { code: '0415', name: '성신여대입구', lines: ['4'], lat: 37.5927, lng: 127.0168 },
  { code: '0416', name: '한성대입구', lines: ['4'], lat: 37.5883, lng: 127.0064 },
  { code: '0417', name: '혜화', lines: ['4'], lat: 37.5827, lng: 127.0019 },
  { code: '0418', name: '동대문', lines: ['1', '4'], lat: 37.5712, lng: 127.0095 },
  { code: '0419', name: '명동', lines: ['4'], lat: 37.5607, lng: 126.9861 },
  { code: '0420', name: '회현', lines: ['4'], lat: 37.5586, lng: 126.9780 },
  { code: '0421', name: '숙대입구', lines: ['4'], lat: 37.5455, lng: 126.9722 },
  { code: '0422', name: '삼각지', lines: ['4', '6'], lat: 37.5344, lng: 126.9732 },
  { code: '0423', name: '이촌', lines: ['4'], lat: 37.5213, lng: 126.9707 },
  { code: '0424', name: '동작', lines: ['4', '9'], lat: 37.5089, lng: 126.9574 },
  { code: '0425', name: '총신대입구', lines: ['4', '7'], lat: 37.4865, lng: 126.9824 },
  { code: '0426', name: '사당', lines: ['2', '4'], lat: 37.4765, lng: 126.9816 },
  { code: '0427', name: '남태령', lines: ['4'], lat: 37.4644, lng: 126.9872 },
  { code: '0428', name: '선바위', lines: ['4'], lat: 37.4528, lng: 126.9892 },
  { code: '0429', name: '경마공원', lines: ['4'], lat: 37.4404, lng: 126.9938 },
  { code: '0430', name: '대공원', lines: ['4'], lat: 37.4290, lng: 126.9966 },
  { code: '0431', name: '과천', lines: ['4'], lat: 37.4265, lng: 126.9879 },
  { code: '0432', name: '정부과천청사', lines: ['4'], lat: 37.4224, lng: 126.9899 },
  { code: '0433', name: '인덕원', lines: ['4'], lat: 37.3974, lng: 126.9852 },
  { code: '0434', name: '평촌', lines: ['4'], lat: 37.3902, lng: 126.9838 },
  { code: '0435', name: '범계', lines: ['4'], lat: 37.3894, lng: 126.9521 },
  { code: '0436', name: '금정', lines: ['4'], lat: 37.3716, lng: 126.9425 },
  { code: '0437', name: '산본', lines: ['4'], lat: 37.3588, lng: 126.9330 },

  // ── 5호선 ──
  { code: '0510', name: '방화', lines: ['5'], lat: 37.5735, lng: 126.8150 },
  { code: '0511', name: '개화산', lines: ['5'], lat: 37.5727, lng: 126.8050 },
  { code: '0512', name: '김포공항', lines: ['5', '9'], lat: 37.5625, lng: 126.8014 },
  { code: '0513', name: '송정', lines: ['5'], lat: 37.5570, lng: 126.8098 },
  { code: '0514', name: '마곡', lines: ['5'], lat: 37.5627, lng: 126.8247 },
  { code: '0515', name: '발산', lines: ['5'], lat: 37.5575, lng: 126.8387 },
  { code: '0516', name: '우장산', lines: ['5'], lat: 37.5473, lng: 126.8366 },
  { code: '0517', name: '화곡', lines: ['5'], lat: 37.5409, lng: 126.8391 },
  { code: '0518', name: '까치산', lines: ['5'], lat: 37.5316, lng: 126.8475 },
  { code: '0519', name: '신정', lines: ['5'], lat: 37.5267, lng: 126.8543 },
  { code: '0520', name: '목동', lines: ['5'], lat: 37.5262, lng: 126.8683 },
  { code: '0521', name: '오목교', lines: ['5'], lat: 37.5244, lng: 126.8752 },
  { code: '0522', name: '양평', lines: ['5'], lat: 37.5268, lng: 126.8834 },
  { code: '0523', name: '영등포구청', lines: ['5'], lat: 37.5240, lng: 126.8963 },
  { code: '0524', name: '영등포시장', lines: ['5'], lat: 37.5225, lng: 126.9042 },
  { code: '0525', name: '신길', lines: ['1', '5'], lat: 37.5170, lng: 126.9164 },
  { code: '0526', name: '여의나루', lines: ['5'], lat: 37.5272, lng: 126.9327 },
  { code: '0527', name: '여의도', lines: ['5'], lat: 37.5216, lng: 126.9243 },
  { code: '0528', name: '마포', lines: ['5'], lat: 37.5399, lng: 126.9461 },
  { code: '0529', name: '공덕', lines: ['5', '6'], lat: 37.5440, lng: 126.9516 },
  { code: '0530', name: '애오개', lines: ['5'], lat: 37.5534, lng: 126.9565 },
  { code: '0533', name: '광화문', lines: ['5'], lat: 37.5710, lng: 126.9768 },
  { code: '0534', name: '서대문', lines: ['5'], lat: 37.5654, lng: 126.9664 },
  { code: '0536', name: '청구', lines: ['5', '6'], lat: 37.5601, lng: 127.0140 },
  { code: '0537', name: '신금호', lines: ['5'], lat: 37.5560, lng: 127.0186 },
  { code: '0538', name: '행당', lines: ['5'], lat: 37.5570, lng: 127.0290 },
  { code: '0539', name: '마장', lines: ['5'], lat: 37.5616, lng: 127.0435 },
  { code: '0540', name: '답십리', lines: ['5'], lat: 37.5660, lng: 127.0522 },
  { code: '0541', name: '장한평', lines: ['5'], lat: 37.5614, lng: 127.0644 },
  { code: '0542', name: '군자', lines: ['5', '7'], lat: 37.5571, lng: 127.0794 },
  { code: '0543', name: '아차산', lines: ['5'], lat: 37.5514, lng: 127.0884 },
  { code: '0544', name: '광나루', lines: ['5'], lat: 37.5457, lng: 127.1036 },
  { code: '0545', name: '천호', lines: ['5', '8'], lat: 37.5392, lng: 127.1236 },
  { code: '0546', name: '강동', lines: ['5', '8'], lat: 37.5353, lng: 127.1328 },
  { code: '0547', name: '길동', lines: ['5'], lat: 37.5354, lng: 127.1440 },
  { code: '0548', name: '굽은다리', lines: ['5'], lat: 37.5341, lng: 127.1500 },
  { code: '0549', name: '명일', lines: ['5'], lat: 37.5280, lng: 127.1481 },
  { code: '0550', name: '고덕', lines: ['5'], lat: 37.5275, lng: 127.1542 },
  { code: '0551', name: '상일동', lines: ['5'], lat: 37.5574, lng: 127.1659 },
  { code: '0552', name: '강일', lines: ['5'], lat: 37.5571, lng: 127.1759 },
  { code: '0553', name: '미사', lines: ['5'], lat: 37.5603, lng: 127.1903 },
  { code: '0554', name: '하남풍산', lines: ['5'], lat: 37.5523, lng: 127.2014 },
  { code: '0555', name: '하남시청', lines: ['5'], lat: 37.5407, lng: 127.2139 },
  { code: '0556', name: '하남검단산', lines: ['5'], lat: 37.5337, lng: 127.2249 },

  // ── 6호선 ──
  { code: '0610', name: '응암', lines: ['6'], lat: 37.5987, lng: 126.9132 },
  { code: '0611', name: '역촌', lines: ['6'], lat: 37.6058, lng: 126.9223 },
  { code: '0612', name: '디지털미디어시티', lines: ['6'], lat: 37.5779, lng: 126.8997 },
  { code: '0613', name: '증산', lines: ['6'], lat: 37.5836, lng: 126.9099 },
  { code: '0614', name: '새절', lines: ['6'], lat: 37.5908, lng: 126.9119 },
  { code: '0620', name: '녹사평', lines: ['6'], lat: 37.5344, lng: 126.9871 },
  { code: '0621', name: '이태원', lines: ['6'], lat: 37.5346, lng: 126.9944 },
  { code: '0622', name: '한강진', lines: ['6'], lat: 37.5397, lng: 127.0014 },
  { code: '0623', name: '버티고개', lines: ['6'], lat: 37.5476, lng: 127.0068 },
  { code: '0625', name: '상월곡', lines: ['6'], lat: 37.6037, lng: 127.0556 },
  { code: '0626', name: '돌곶이', lines: ['6'], lat: 37.6101, lng: 127.0555 },
  { code: '0627', name: '석계', lines: ['1', '6'], lat: 37.6147, lng: 127.0657 },
  { code: '0628', name: '태릉입구', lines: ['6', '7'], lat: 37.6179, lng: 127.0752 },
  { code: '0629', name: '화랑대', lines: ['6'], lat: 37.6207, lng: 127.0846 },
  { code: '0630', name: '봉화산', lines: ['6'], lat: 37.6179, lng: 127.0918 },
  { code: '0631', name: '신내', lines: ['6'], lat: 37.6143, lng: 127.1036 },
  { code: '0615', name: '마포구청', lines: ['6'], lat: 37.5630, lng: 126.9060 },
  { code: '0616', name: '망원', lines: ['6'], lat: 37.5562, lng: 126.9104 },
  { code: '0617', name: '광흥창', lines: ['6'], lat: 37.5477, lng: 126.9320 },
  { code: '0618', name: '대흥', lines: ['6'], lat: 37.5475, lng: 126.9421 },
  { code: '0619', name: '효창공원앞', lines: ['6'], lat: 37.5397, lng: 126.9615 },

  // ── 7호선 ──
  { code: '0709', name: '장암', lines: ['7'], lat: 37.6905, lng: 127.0532 },
  { code: '0710', name: '도봉산', lines: ['1', '7'], lat: 37.6717, lng: 127.0319 },
  { code: '0711', name: '수락산', lines: ['7'], lat: 37.6741, lng: 127.0570 },
  { code: '0712', name: '마들', lines: ['7'], lat: 37.6614, lng: 127.0604 },
  { code: '0713', name: '노원', lines: ['4', '7'], lat: 37.6544, lng: 127.0614 },
  { code: '0714', name: '중계', lines: ['7'], lat: 37.6444, lng: 127.0635 },
  { code: '0715', name: '하계', lines: ['7'], lat: 37.6369, lng: 127.0675 },
  { code: '0716', name: '공릉', lines: ['7'], lat: 37.6260, lng: 127.0726 },
  { code: '0718', name: '상봉', lines: ['7'], lat: 37.5966, lng: 127.0855 },
  { code: '0719', name: '면목', lines: ['7'], lat: 37.5833, lng: 127.0854 },
  { code: '0720', name: '사가정', lines: ['7'], lat: 37.5730, lng: 127.0878 },
  { code: '0721', name: '용마산', lines: ['7'], lat: 37.5640, lng: 127.0863 },
  { code: '0722', name: '중곡', lines: ['7'], lat: 37.5571, lng: 127.0836 },
  { code: '0724', name: '어린이대공원', lines: ['7'], lat: 37.5481, lng: 127.0739 },
  { code: '0725', name: '뚝섬유원지', lines: ['7'], lat: 37.5317, lng: 127.0661 },
  { code: '0726', name: '청담', lines: ['7'], lat: 37.5189, lng: 127.0533 },
  { code: '0727', name: '강남구청', lines: ['7'], lat: 37.5172, lng: 127.0416 },
  { code: '0728', name: '학동', lines: ['7'], lat: 37.5142, lng: 127.0314 },
  { code: '0729', name: '논현', lines: ['7'], lat: 37.5112, lng: 127.0214 },
  { code: '0730', name: '반포', lines: ['7'], lat: 37.5079, lng: 127.0133 },
  { code: '0731', name: '내방', lines: ['7'], lat: 37.4878, lng: 126.9935 },
  { code: '0732', name: '이수', lines: ['4', '7'], lat: 37.4865, lng: 126.9824 },
  { code: '0733', name: '남성', lines: ['7'], lat: 37.4851, lng: 126.9726 },
  { code: '0734', name: '숭실대입구', lines: ['7'], lat: 37.4964, lng: 126.9536 },
  { code: '0735', name: '상도', lines: ['7'], lat: 37.5027, lng: 126.9440 },
  { code: '0736', name: '장승배기', lines: ['7'], lat: 37.5067, lng: 126.9366 },
  { code: '0737', name: '신대방삼거리', lines: ['7'], lat: 37.4893, lng: 126.9192 },
  { code: '0738', name: '보라매', lines: ['7'], lat: 37.4966, lng: 126.9141 },
  { code: '0739', name: '신풍', lines: ['7'], lat: 37.5092, lng: 126.9053 },
  { code: '0740', name: '대림', lines: ['2', '7'], lat: 37.4922, lng: 126.8992 },
  { code: '0741', name: '남구로', lines: ['7'], lat: 37.4854, lng: 126.8872 },
  { code: '0742', name: '가산디지털단지', lines: ['1', '7'], lat: 37.4815, lng: 126.8826 },
  { code: '0743', name: '철산', lines: ['7'], lat: 37.4771, lng: 126.8682 },
  { code: '0744', name: '광명사거리', lines: ['7'], lat: 37.4673, lng: 126.8589 },
  { code: '0745', name: '천왕', lines: ['7'], lat: 37.4597, lng: 126.8472 },
  { code: '0746', name: '온수', lines: ['1', '7'], lat: 37.4926, lng: 126.8230 },

  // ── 8호선 ──
  { code: '0810', name: '암사', lines: ['8'], lat: 37.5505, lng: 127.1271 },
  { code: '0811', name: '천호', lines: ['5', '8'], lat: 37.5392, lng: 127.1236 },
  { code: '0812', name: '강동구청', lines: ['8'], lat: 37.5311, lng: 127.1270 },
  { code: '0813', name: '몽촌토성', lines: ['8'], lat: 37.5172, lng: 127.1126 },
  { code: '0814', name: '잠실', lines: ['2', '8'], lat: 37.5133, lng: 127.1001 },
  { code: '0815', name: '석촌', lines: ['8', '9'], lat: 37.5056, lng: 127.1060 },
  { code: '0816', name: '송파', lines: ['8'], lat: 37.5010, lng: 127.1094 },
  { code: '0817', name: '가락시장', lines: ['3', '8'], lat: 37.4926, lng: 127.1183 },
  { code: '0818', name: '문정', lines: ['8'], lat: 37.4853, lng: 127.1217 },
  { code: '0819', name: '장지', lines: ['8'], lat: 37.4785, lng: 127.1261 },
  { code: '0820', name: '복정', lines: ['8'], lat: 37.4712, lng: 127.1263 },
  { code: '0821', name: '산성', lines: ['8'], lat: 37.4586, lng: 127.1393 },
  { code: '0822', name: '남한산성입구', lines: ['8'], lat: 37.4515, lng: 127.1484 },
  { code: '0823', name: '단대오거리', lines: ['8'], lat: 37.4445, lng: 127.1554 },
  { code: '0824', name: '신흥', lines: ['8'], lat: 37.4397, lng: 127.1570 },
  { code: '0825', name: '수진', lines: ['8'], lat: 37.4362, lng: 127.1496 },
  { code: '0826', name: '모란', lines: ['8'], lat: 37.4326, lng: 127.1292 },

  // ── 9호선 ──
  { code: '0901', name: '개화', lines: ['9'], lat: 37.5729, lng: 126.7987 },
  { code: '0902', name: '김포공항', lines: ['5', '9'], lat: 37.5625, lng: 126.8014 },
  { code: '0903', name: '공항시장', lines: ['9'], lat: 37.5614, lng: 126.8122 },
  { code: '0904', name: '신방화', lines: ['9'], lat: 37.5637, lng: 126.8204 },
  { code: '0905', name: '마곡나루', lines: ['9'], lat: 37.5660, lng: 126.8332 },
  { code: '0906', name: '양천향교', lines: ['9'], lat: 37.5461, lng: 126.8597 },
  { code: '0907', name: '가양', lines: ['9'], lat: 37.5613, lng: 126.8547 },
  { code: '0908', name: '증미', lines: ['9'], lat: 37.5572, lng: 126.8681 },
  { code: '0909', name: '등촌', lines: ['9'], lat: 37.5514, lng: 126.8725 },
  { code: '0910', name: '염창', lines: ['9'], lat: 37.5468, lng: 126.8767 },
  { code: '0911', name: '신목동', lines: ['9'], lat: 37.5442, lng: 126.8831 },
  { code: '0912', name: '선유도', lines: ['9'], lat: 37.5367, lng: 126.8940 },
  { code: '0913', name: '당산', lines: ['2', '9'], lat: 37.5339, lng: 126.9023 },
  { code: '0914', name: '국회의사당', lines: ['9'], lat: 37.5288, lng: 126.9188 },
  { code: '0915', name: '여의도', lines: ['5', '9'], lat: 37.5216, lng: 126.9243 },
  { code: '0916', name: '샛강', lines: ['9'], lat: 37.5166, lng: 126.9289 },
  { code: '0917', name: '노량진', lines: ['1', '9'], lat: 37.5135, lng: 126.9425 },
  { code: '0918', name: '노들', lines: ['9'], lat: 37.5122, lng: 126.9512 },
  { code: '0919', name: '흑석', lines: ['9'], lat: 37.5083, lng: 126.9634 },
  { code: '0920', name: '동작', lines: ['4', '9'], lat: 37.5089, lng: 126.9574 },
  { code: '0921', name: '구반포', lines: ['9'], lat: 37.5084, lng: 126.9868 },
  { code: '0922', name: '신반포', lines: ['9'], lat: 37.5082, lng: 126.9940 },
  { code: '0923', name: '고속터미널', lines: ['3', '7', '9'], lat: 37.5049, lng: 127.0049 },
  { code: '0924', name: '사평', lines: ['9'], lat: 37.5069, lng: 127.0143 },
  { code: '0925', name: '신논현', lines: ['9'], lat: 37.5047, lng: 127.0247 },
  { code: '0926', name: '언주', lines: ['9'], lat: 37.5076, lng: 127.0340 },
  { code: '0927', name: '선정릉', lines: ['9'], lat: 37.5102, lng: 127.0431 },
  { code: '0928', name: '삼성중앙', lines: ['9'], lat: 37.5082, lng: 127.0555 },
  { code: '0929', name: '봉은사', lines: ['9'], lat: 37.5150, lng: 127.0590 },
  { code: '0930', name: '종합운동장', lines: ['2', '9'], lat: 37.5111, lng: 127.0738 },
  { code: '0931', name: '삼전', lines: ['9'], lat: 37.5075, lng: 127.0830 },
  { code: '0932', name: '석촌고분', lines: ['9'], lat: 37.5070, lng: 127.0926 },
  { code: '0933', name: '석촌', lines: ['8', '9'], lat: 37.5056, lng: 127.1060 },
  { code: '0934', name: '송파나루', lines: ['9'], lat: 37.5009, lng: 127.1181 },
  { code: '0935', name: '한성백제', lines: ['9'], lat: 37.4969, lng: 127.1253 },
  { code: '0936', name: '올림픽공원', lines: ['5', '9'], lat: 37.5160, lng: 127.1310 },
  { code: '0937', name: '둔촌오륜', lines: ['9'], lat: 37.5220, lng: 127.1394 },
  { code: '0938', name: '중앙보훈병원', lines: ['9'], lat: 37.5276, lng: 127.1483 },
];

// 중복 code 제거 (환승역은 첫 등장만 유지, lines 병합)
const mergedMap = new Map<string, StationMeta>();
for (const s of _RAW_STATIONS) {
  const existing = mergedMap.get(s.code);
  if (existing) {
    const merged = new Set([...existing.lines, ...s.lines]);
    existing.lines = [...merged];
  } else {
    mergedMap.set(s.code, { ...s });
  }
}

export const STATIONS: StationMeta[] = [...mergedMap.values()];

export function searchStations(query: string): StationMeta[] {
  const q = query.trim();
  if (q.length < 2) {
    // 호선 번호 매칭은 1자도 허용
    if (/^[1-9]$/.test(q)) return getStationsByLine(q);
    return [];
  }

  // 호선 번호 매칭
  if (/^[1-9]$/.test(q)) return getStationsByLine(q);

  const isChosung = isChosungOnly(q);
  const qLower = q.toLowerCase();

  type Ranked = { station: StationMeta; rank: number };
  const results: Ranked[] = [];

  for (const s of STATIONS) {
    const name = s.name.toLowerCase();
    if (name === qLower) {
      results.push({ station: s, rank: 0 }); // 정확일치
    } else if (name.startsWith(qLower)) {
      results.push({ station: s, rank: 1 }); // prefix
    } else if (isChosung && getChosung(s.name).startsWith(q)) {
      results.push({ station: s, rank: 2 }); // 초성
    } else if (name.includes(qLower)) {
      results.push({ station: s, rank: 3 }); // contains
    }
  }

  return results
    .sort((a, b) => a.rank - b.rank || a.station.name.length - b.station.name.length)
    .map(r => r.station);
}

export function getStation(code: string): StationMeta | undefined {
  return STATIONS.find((s) => s.code === code);
}

/** 호선별 역 목록 */
export function getStationsByLine(line: string): StationMeta[] {
  return STATIONS.filter((s) => s.lines.includes(line));
}

/** 같은 노선 내 이전/다음 역 반환 */
export function getAdjacentStations(code: string): { prev?: StationMeta; next?: StationMeta; line: string } | null {
  const station = getStation(code);
  if (!station) return null;
  const line = station.lines[0];
  const lineStations = getStationsByLine(line);
  const idx = lineStations.findIndex((s) => s.code === code);
  if (idx === -1) return null;
  return {
    prev: idx > 0 ? lineStations[idx - 1] : undefined,
    next: idx < lineStations.length - 1 ? lineStations[idx + 1] : undefined,
    line,
  };
}

/** 사용 가능한 호선 목록 */
export const LINES = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
export type Line = (typeof LINES)[number];
