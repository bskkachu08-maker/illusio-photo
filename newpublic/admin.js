document.getElementById("uploadForm").addEventListener("submit", async (e)=>{
 e.preventDefault();
 const formData = new FormData(e.target);
 const res = await fetch("/upload", { method:"POST", body:formData });
 const data = await res.json();
 const result = document.getElementById("result");
 if(data.success){
   result.innerHTML = "✅ アップロード成功しました！<br><a href='index.html'>一覧へ戻る</a>";
   e.target.reset();
 }else{
   result.textContent = "❌ 失敗しました。パスワードまたはファイルを確認してください。";
 }
});
