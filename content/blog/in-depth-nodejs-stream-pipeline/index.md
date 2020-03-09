---
status: public
title: Cách pipe Stream hoạt động trong Nodejs, khởi đầu cho việc custom Stream
date: "2020-02-09T16:12:03.284Z"
description: "Cơ chế hoạt động của Pipeline trong Nodejs Stream"
---

## Mở đầu

#### Lại là mình đây, sau một thời gian nghiên cứu fontend từ reactjs đến react-native, mình lại quay trở về với cái máng Backend :D.

Thời điểm này mình mới xin đi thực tập ở một công ty khác tại Hà Nội, tại đây công việc của mình là chạy theo task được giao, không phân biệt font-end hay back-end cứ có việc là mình làm. Hồi đó(mới có 2, 3 ngày trước à) anh mentor của mình có giao cho mình xử lý việc exporting từ data mongodb qua file csv khi dữ liệu trở lên quá lớn. Với source của api cũ thì export đã được viết sẵn nhưng chỉ xử lý được dữ liệu nhỏ, đối với dữ liệu lớn thì app sẽ bị crash do việc sử dụng ram bị vượt quá mức cho phép, với flow cũ thì việc xử lý hoạt động như sau:
- Vì dữ liệu lớn nên cần phải chia nhỏ query dữ liệu chứ không thể query 1 câu find() để lấy tất ra được, sử dụng 1 mảng để đẩy dữ liệu vào sau mỗi lần query -> tới khi lấy đc hết ra dữ liệu thì sẽ parse mảng data kia thành csv rồi lưu ra file -> trả lại file cho response.
- Tại đây có 2 vấn đề xảy ra, thứ nhất là việc làm trên nếu mất quá nhiều thời gian có thể làm request bị timeout, thứ 2 là việc lưu dữ liệu vào mảng data sẽ ngốn rất nhiều memory là lý do mà app bị crash

Tại đây mình đưa ra giải pháp là sử dụng cơ chế Stream của nodejs, có 2 ưu điểm mà trong trường hợp này phải sư dụng cơ chế Stream. 
- Thứ nhất là nếu pipe 1 Readable stream với res(response là 1 Writeable) thì request sẽ được giữ kết nối và không bị timeout(nếu như Readable vẫn tiếp tục truyền được dữ liệu )
- Thứ 2 là cơ chế streaming cho phép Readable đọc 1 phần dữ liệu sau đó send qua Writeable thì bộ nhớ cần cho việc đọc ra 1 phần dữ liệu sẽ rất nhỏ và vì thế không gây ra lỗi ngốn memory

## Tiếp cận Nodejs Pipe Stream
Nói vấn đề đủ rồi, giờ đi vào phần chính nè. Ngay lúc đó mình research ngay các từ khóa : "Nodejs Stream", "How to convertCSV with Stream in Nodejs", "How to query data in mongodb with stream using mongoose", ... Ngày trước khi tìm hiểu node mình có đọc qua về Stream nhưng thực sự là chưa ứng dụng nhiều nên giờ quên, chỉ hiểu mục đích sử dụng của stream và cơ chế pipe. Mình recomend các bạn nên đọc Document của Nodejs vì nó theo mình thấy là đầy đủ và chính xác nhất. Lúc đó mình tìm đc 1 package là csv-stringify là một Transform Stream dùng để convert object thành dạng string csv, ngoài ra cũng tìm đc cách sử dụng stream trong query của mongoose là sử dụng cusor(). Lúc sau thì anh mentor có send mình cái Project mà anh đã viết sẵn 1 Custom Stream dành cho việc convert data từ mongodb và convert sang csv. Nhưng mình đã tìm thấy một cách khác stream nhanh hơn vì vậy mình đã implement cách của mình

Tại Doc của Nodejs mình có tìm được việc implement API Stream khá đơn giản chỉ có việc implement các method _read, _write, ... là xong. Nhưng nó hoạt động ra sao, flow thế nào? Mình bắt đầu tìm hiểu xem làm sao để các method đó được gọi, và làm sao để Readable có thể đọc nhỏ giọt dữ liệu rồi truyền cho Writeable , phải có một cơ chế quản lý nó chứ ?
Có thể nếu đọc kỹ Doc các bạn sẽ phát hiện ra ngay là tại mỗi option của một Stream sẽ có property là `highWaterMark`, đối với mỗi stream sẽ có 1 kho buffer của riêng mình để quản lý việc lưu trữ tạm dữ liệu, thì cái property kia trong options để quy định số byte mà kho buffer có thể chứa, và nó cũng liên quan đến một loạt cơ chế để kiểm tra kho buffer có đầy hay không để quyết định đọc tiếp dữ liệu(hoặc tiêu thụ tiếp dữ liệu), nhưng mọi việc đó thì không cần quan tâm vì hàm pipe nó đã làm tất cả việc đó giúp mình rồi, bài viết nói về nó [here](https://nodejs.org/es/docs/guides/backpressuring-in-streams)

Mình sẽ chỉ tóm gọn lại một vài điểm chính về cách nó hoạt động (theo nhận thức của mình, nên sự chính xác là không tuyệt đối ):
- Do Stream cũng implement Event trong Nodejs vì vậy mà nó thông qua event để thực hiện một vài cơ chế hay ho. 
- Nói về Writable trước, khi pipe thì sẽ có một cơ chế để kiểm tra buffer của writable có đầy hay không rồi mới đẩy dữ liệu vào, flow của việc write sẽ là gọi `write(data)` -> trong hàm write sẽ gọi `_write` để thực hiện việc ghi dữ liệu ra theo implement của `_write`, hàm write có arg thứ 3 là `callback` thì `callback` này được viết bằng native code(nghĩa là không phải js code) sẽ được gọi khi mà việc ghi dữ liệu ra 1 nguồn mà mình muốn ghi có thành công hay không,  thì khả năng theo mình đoán thì trong hàm call này sẽ làm một vài thứ, một trong số đó là : Nếu buffer full thì vì là vừa ghi đc dữ liệu ra xong vì vậy mà buffer đã ghi sẽ đc giải phóng và lúc đó nó sẽ emit event `"drain"` và một vài cơ chế nữa mình k rõ :D,  việc gọi hàm `callback`này rât quan trọng vì nếu bạn không gọi thì coi như sau lần ghi này là kết thúc không được gọi nữa,  giá trị trả về của hàm `write` ở trên là trạng thái của buffer có đầy hay không, nếu nó đầy thì sẽ nhúng callback vào event `"drain"` để call lại write khi buffer không còn đầy nữa kiểu dạng `writer.on("drain", writer.write(data))`
- Về Readable thì cũng có một cơ chế để kiểm soát kho buffer này. Có 2 mode của Readable cần lưu ý là `paused mode` và `flowing mode`,  2 mode này sẽ quyết định việc đọc dữ liệu đc tạm dừng hay tiếp tục. FLow chính của nó sẽ dạng: call `reader.push()` -> trong hàm này sẽ check xem buffer có đầy hay không để gọi `_read` mà đã đc implement và trong `_read` chúng ta gọi đến `this.push(data)` để đẩy data vào buffer, hàm `push` có dạng 
```js
function(chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
}
```
- nó sẽ gọi đến hàm `readableAddChunk` tại đây mình đoán là nó sẽ xử lý để có thể tạm dừng read nếu buffer đầy và đăng ký 1 event để sau khi buffer còn trống sẽ đưa readable trở về trạng thái đọc dữ liệu.
- Hàm pipe sẽ có tác dụng là điều phối call `read` từ readable để lấy dữ liệu và call `write` của writable để đẩy dữ liệu, thực hiện qua các flow như ở trên.
Đó là những gì mình nghĩ nó sẽ xảy ra trong quá trình pipeline, không chắc chắn lắm nhưng để hiểu đơn giản thì chấp nhận được :D

## Tổng kết

Stream là một cơ chế vô cùng tuyệt vời để tiếp cận khi xử lý một lượng dữ liệu lớn, phần lớn trên npm có rất nhiều package xử lý stream và chúng ta chỉ cần sử dụng nó cũng như xử lý logic với nó, việc hiểu biết thêm về cơ chế bên trong nó sẽ khá hữu ích trong quá trình gặp lỗi và phát triển một stream của riêng mình.

Nguồn :
[Nodejs Stream API](https://nodejs.org/api/stream.html)
[Backpressuring in Streams](https://nodejs.org/es/docs/guides/backpressuring-in-streams/?fbclid=IwAR0h_vsH0NGXtFAUeWArcOmsdiuYe67Ds4PkpefY4jLhcGoQbYIGyxWMKsQ)