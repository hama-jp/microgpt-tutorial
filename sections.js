// Each section: { id, title, code, lineRange, explanation, keyPoint, diagram }
const SECTIONS = [
  // ===== Section 1: Data Loading =====
  {
    id: "data",
    title: "データの読み込み",
    lineRange: "17-24行目",
    code: `# --- Data ---
if not os.path.exists('input.txt'):
    import urllib.request
    names_url = 'https://raw.githubusercontent.com/...'
    urllib.request.urlretrieve(names_url, 'input.txt')
docs = [l.strip() for l in open('input.txt')
            .read().strip().split('\\n') if l.strip()]
random.shuffle(docs)
print(f"num docs: {len(docs)}")`,
    explanation: [
      "このセクションでは、<strong>学習データ</strong>を準備します。データは人名のリスト（約32,000件）で、1行に1つの名前が書かれたテキストファイルです。",
      "まず <code>input.txt</code> が存在しなければインターネットからダウンロードします。次にファイルを読み込み、空行を除去してリストにします。",
      "<code>random.shuffle(docs)</code> でデータの順番をランダムに並べ替えます。これにより、学習時に偏りなくデータを使えます。"
    ],
    keyPoint: "GPTモデルの学習には大量のテキストデータが必要です。ここでは人名リスト（emma, olivia, ava, ...）を1件ずつ「ドキュメント」として扱います。",
    diagram: `<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: sans-serif; fill: #e2e4ed; }
    .label { font-size: 13px; fill: #8b8fa8; }
    .data { font-size: 14px; font-family: monospace; }
    .box { fill: #232734; stroke: #2e3348; stroke-width: 1.5; rx: 8; }
    .arrow { stroke: #6c8cff; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
  </style>
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6c8cff"/>
    </marker>
  </defs>
  <!-- File -->
  <rect class="box" x="20" y="30" width="140" height="140"/>
  <text class="label" x="90" y="55" text-anchor="middle">input.txt</text>
  <text class="data" x="40" y="80">emma</text>
  <text class="data" x="40" y="100">olivia</text>
  <text class="data" x="40" y="120">ava</text>
  <text class="data" x="40" y="140" fill="#546e7a">... (32K件)</text>
  <!-- Arrow -->
  <path class="arrow" d="M170,100 L230,100"/>
  <!-- Shuffle -->
  <rect class="box" x="240" y="55" width="120" height="90"/>
  <text class="label" x="300" y="80" text-anchor="middle">shuffle</text>
  <text class="data" x="260" y="105">ava</text>
  <text class="data" x="260" y="125">emma</text>
  <!-- Arrow -->
  <path class="arrow" d="M370,100 L430,100"/>
  <!-- docs list -->
  <rect class="box" x="440" y="40" width="140" height="120"/>
  <text class="label" x="510" y="65" text-anchor="middle">docs (リスト)</text>
  <text class="data" x="460" y="90">["ava",</text>
  <text class="data" x="460" y="110"> "emma",</text>
  <text class="data" x="460" y="130"> ...]</text>
</svg>`,
    diagramLabel: "テキストファイルからリストへの変換"
  },

  // ===== Section 2: Tokenizer =====
  {
    id: "tokenizer",
    title: "トークナイザー（文字→数値変換）",
    lineRange: "26-30行目",
    code: `# --- Tokenizer ---
uchars = sorted(set(''.join(docs)))
BOS = len(uchars)
vocab_size = len(uchars) + 1
print(f"vocab size: {vocab_size}")`,
    explanation: [
      "コンピュータは文字をそのまま計算に使えないので、<strong>各文字に番号（ID）を割り当て</strong>ます。これが「トークナイザー」の役割です。",
      "<code>uchars</code> は、全名前に出現するユニークな文字をアルファベット順に並べたリストです。例えば <em>a=0, b=1, c=2, ...</em> のように対応します。",
      "<code>BOS</code>（Beginning Of Sequence）は、名前の<strong>開始・終了を示す特別なトークン</strong>です。語彙サイズは全文字数+1（BOS分）になります。"
    ],
    keyPoint: "文字レベルのトークナイザーは最もシンプルな方式です。ChatGPTなどはサブワード（単語の断片）レベルのトークナイザーを使いますが、原理は同じ「テキスト→数値ID」の変換です。",
    diagram: `<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: sans-serif; fill: #e2e4ed; }
    .label { font-size: 12px; fill: #8b8fa8; }
    .char { font-size: 18px; font-weight: bold; font-family: monospace; }
    .id { font-size: 14px; font-family: monospace; fill: #fb923c; }
    .box { fill: #232734; stroke: #2e3348; stroke-width: 1.5; rx: 6; }
    .bos-box { fill: #2d1f3d; stroke: #c792ea; stroke-width: 1.5; rx: 6; }
    .arrow { stroke: #6c8cff; stroke-width: 2; fill: none; marker-end: url(#ah2); }
  </style>
  <defs>
    <marker id="ah2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6c8cff"/>
    </marker>
  </defs>
  <text class="label" x="300" y="20" text-anchor="middle">語彙テーブル（uchars + BOS）</text>
  <!-- Characters -->
  <rect class="box" x="30" y="35" width="50" height="55"/>
  <text class="char" x="55" y="60" text-anchor="middle">a</text>
  <text class="id" x="55" y="80" text-anchor="middle">ID: 0</text>

  <rect class="box" x="95" y="35" width="50" height="55"/>
  <text class="char" x="120" y="60" text-anchor="middle">b</text>
  <text class="id" x="120" y="80" text-anchor="middle">ID: 1</text>

  <rect class="box" x="160" y="35" width="50" height="55"/>
  <text class="char" x="185" y="60" text-anchor="middle">c</text>
  <text class="id" x="185" y="80" text-anchor="middle">ID: 2</text>

  <text class="label" x="240" y="65" text-anchor="middle">...</text>

  <rect class="box" x="270" y="35" width="50" height="55"/>
  <text class="char" x="295" y="60" text-anchor="middle">z</text>
  <text class="id" x="295" y="80" text-anchor="middle">ID: 25</text>

  <rect class="bos-box" x="340" y="35" width="70" height="55"/>
  <text class="char" x="375" y="60" text-anchor="middle" fill="#c792ea">BOS</text>
  <text class="id" x="375" y="80" text-anchor="middle" fill="#c792ea">ID: 26</text>

  <!-- Example -->
  <text class="label" x="30" y="125">例: "ava" のトークン列</text>
  <rect class="bos-box" x="30" y="135" width="55" height="35"/>
  <text class="char" x="57" y="158" text-anchor="middle" fill="#c792ea" font-size="13">BOS</text>
  <path class="arrow" d="M90,152 L105,152"/>
  <rect class="box" x="110" y="135" width="45" height="35"/>
  <text class="char" x="132" y="158" text-anchor="middle" font-size="15">a</text>
  <path class="arrow" d="M160,152 L175,152"/>
  <rect class="box" x="180" y="135" width="45" height="35"/>
  <text class="char" x="202" y="158" text-anchor="middle" font-size="15">v</text>
  <path class="arrow" d="M230,152 L245,152"/>
  <rect class="box" x="250" y="135" width="45" height="35"/>
  <text class="char" x="272" y="158" text-anchor="middle" font-size="15">a</text>
  <path class="arrow" d="M300,152 L315,152"/>
  <rect class="bos-box" x="320" y="135" width="55" height="35"/>
  <text class="char" x="347" y="158" text-anchor="middle" fill="#c792ea" font-size="13">BOS</text>

  <text class="id" x="57" y="175" text-anchor="middle">[26</text>
  <text class="id" x="132" y="175" text-anchor="middle">0</text>
  <text class="id" x="202" y="175" text-anchor="middle">21</text>
  <text class="id" x="272" y="175" text-anchor="middle">0</text>
  <text class="id" x="347" y="175" text-anchor="middle">26]</text>
</svg>`,
    diagramLabel: "文字とIDの対応表、および \"ava\" のトークン化例"
  },

  // ===== Section 3: Hyperparameters =====
  {
    id: "hyperparams",
    title: "モデル設定（ハイパーパラメータ）",
    lineRange: "32-37行目",
    code: `# --- Model ---
n_embd = 16      # 埋め込み次元
n_head = 4       # アテンションヘッド数
n_layer = 1      # Transformerブロック数
block_size = 16  # 最大シーケンス長
head_dim = n_embd // n_head  # = 4`,
    explanation: [
      "ここではモデルの<strong>サイズや構造を決める設定値</strong>を定義します。実際のGPT-3やGPT-4はこれらが巨大ですが、ここではミニチュア版として非常に小さな値を使います。",
      "<strong>n_embd=16</strong>: 各トークンを16次元のベクトルで表現します。GPT-3は12,288次元です。",
      "<strong>n_head=4</strong>: アテンションを4つの「頭」に分けて並列計算します。各ヘッドは <code>head_dim = 16÷4 = 4</code> 次元を担当します。",
      "<strong>n_layer=1</strong>: Transformerブロックを1層だけ使います（GPT-3は96層）。<strong>block_size=16</strong>: 一度に処理できる最大トークン数です。"
    ],
    keyPoint: "これらの値を大きくすれば、より賢いモデルになりますが、計算コストも比例して増大します。MicroGPTはパラメータ数わずか約3,000で動く教育用の極小モデルです。",
    diagram: `<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: sans-serif; fill: #e2e4ed; }
    .label { font-size: 11px; fill: #8b8fa8; }
    .val { font-size: 22px; font-weight: bold; font-family: monospace; }
    .name { font-size: 13px; }
    .box { fill: #232734; stroke: #2e3348; stroke-width: 1.5; rx: 10; }
    .compare { font-size: 10px; fill: #546e7a; }
  </style>
  <text class="label" x="300" y="18" text-anchor="middle">MicroGPT vs 実際のGPT-3 の比較</text>
  <!-- n_embd -->
  <rect class="box" x="20" y="30" width="130" height="80"/>
  <text class="name" x="85" y="52" text-anchor="middle">埋め込み次元</text>
  <text class="val" x="85" y="80" text-anchor="middle" fill="#6c8cff">16</text>
  <text class="compare" x="85" y="100" text-anchor="middle">GPT-3: 12,288</text>
  <!-- n_head -->
  <rect class="box" x="165" y="30" width="130" height="80"/>
  <text class="name" x="230" y="52" text-anchor="middle">ヘッド数</text>
  <text class="val" x="230" y="80" text-anchor="middle" fill="#4ade80">4</text>
  <text class="compare" x="230" y="100" text-anchor="middle">GPT-3: 96</text>
  <!-- n_layer -->
  <rect class="box" x="310" y="30" width="130" height="80"/>
  <text class="name" x="375" y="52" text-anchor="middle">レイヤー数</text>
  <text class="val" x="375" y="80" text-anchor="middle" fill="#fb923c">1</text>
  <text class="compare" x="375" y="100" text-anchor="middle">GPT-3: 96</text>
  <!-- block_size -->
  <rect class="box" x="455" y="30" width="130" height="80"/>
  <text class="name" x="520" y="52" text-anchor="middle">最大長</text>
  <text class="val" x="520" y="80" text-anchor="middle" fill="#f472b6">16</text>
  <text class="compare" x="520" y="100" text-anchor="middle">GPT-3: 2,048</text>
  <!-- head_dim calculation -->
  <rect class="box" x="120" y="140" width="360" height="65"/>
  <text class="name" x="300" y="163" text-anchor="middle">head_dim = n_embd ÷ n_head = 16 ÷ 4 = <tspan fill="#22d3ee" font-weight="bold" font-size="17">4</tspan></text>
  <text class="label" x="300" y="190" text-anchor="middle">各アテンションヘッドが担当する次元数</text>
</svg>`,
    diagramLabel: "ハイパーパラメータの比較（MicroGPT vs GPT-3）"
  },

  // ===== Section 4: RMSNorm =====
  {
    id: "rmsnorm",
    title: "RMSNorm（正規化レイヤー）",
    lineRange: "40-48行目",
    code: `class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-5):
        super().__init__()
        self.eps = eps

    def forward(self, x):
        # x: (..., dim)
        ms = (x * x).mean(dim=-1, keepdim=True)
        return x * torch.rsqrt(ms + self.eps)`,
    explanation: [
      "<strong>RMSNorm</strong>（Root Mean Square Normalization）は、ベクトルの大きさを<strong>一定に揃える</strong>ための処理です。",
      "計算の流れ: ①各要素を二乗 → ②平均をとる → ③平方根の逆数を掛ける。つまりベクトルの「RMS（二乗平均平方根）」で割り算しているのと同じです。",
      "なぜ必要？ ニューラルネットワークでは、層を重ねるうちにベクトルの値が大きくなりすぎたり小さくなりすぎたりします。正規化によって<strong>学習を安定</strong>させます。",
      "<code>eps=1e-5</code> はゼロ除算を防ぐための極小値です。"
    ],
    keyPoint: "RMSNormはLayerNormの簡易版で、平均を引く処理を省略しています。LLaMAなどの最新モデルで採用されています。",
    diagram: `<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: sans-serif; fill: #e2e4ed; }
    .label { font-size: 12px; fill: #8b8fa8; }
    .val { font-size: 14px; font-family: monospace; }
    .box { fill: #232734; stroke: #2e3348; stroke-width: 1.5; rx: 8; }
    .op-box { fill: #1e2a1e; stroke: #4ade80; stroke-width: 1.5; rx: 8; }
    .arrow { stroke: #6c8cff; stroke-width: 2; fill: none; marker-end: url(#ah4); }
  </style>
  <defs>
    <marker id="ah4" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6c8cff"/>
    </marker>
  </defs>
  <text class="label" x="300" y="18" text-anchor="middle">RMSNorm の計算フロー（例: 4次元ベクトル）</text>
  <!-- Input -->
  <rect class="box" x="10" y="35" width="110" height="70"/>
  <text class="label" x="65" y="52" text-anchor="middle">入力 x</text>
  <text class="val" x="65" y="75" text-anchor="middle">[2.0, -1.0,</text>
  <text class="val" x="65" y="93" text-anchor="middle"> 0.5, 3.0]</text>
  <!-- Step 1 -->
  <path class="arrow" d="M125,70 L145,70"/>
  <rect class="op-box" x="150" y="40" width="90" height="60"/>
  <text class="val" x="195" y="63" text-anchor="middle" fill="#4ade80">x * x</text>
  <text class="val" x="195" y="82" text-anchor="middle" font-size="11">[4, 1, .25, 9]</text>
  <!-- Step 2 -->
  <path class="arrow" d="M245,70 L265,70"/>
  <rect class="op-box" x="270" y="40" width="80" height="60"/>
  <text class="val" x="310" y="63" text-anchor="middle" fill="#4ade80">mean</text>
  <text class="val" x="310" y="82" text-anchor="middle" font-size="11">= 3.5625</text>
  <!-- Step 3 -->
  <path class="arrow" d="M355,70 L375,70"/>
  <rect class="op-box" x="380" y="40" width="80" height="60"/>
  <text class="val" x="420" y="60" text-anchor="middle" fill="#4ade80">1/√ms</text>
  <text class="val" x="420" y="82" text-anchor="middle" font-size="11">= 0.5298</text>
  <!-- Step 4 -->
  <path class="arrow" d="M465,70 L485,70"/>
  <rect class="box" x="490" y="35" width="100" height="70"/>
  <text class="label" x="540" y="52" text-anchor="middle">出力</text>
  <text class="val" x="540" y="75" text-anchor="middle" font-size="12">[1.06, -0.53,</text>
  <text class="val" x="540" y="93" text-anchor="middle" font-size="12"> 0.26, 1.59]</text>
  <!-- Bottom note -->
  <rect class="box" x="100" y="130" width="400" height="50"/>
  <text x="300" y="152" text-anchor="middle" font-size="13">ベクトルの<tspan fill="#4ade80" font-weight="bold">方向はそのまま</tspan>、<tspan fill="#fb923c" font-weight="bold">大きさだけ揃える</tspan></text>
  <text class="label" x="300" y="170" text-anchor="middle">→ 学習を安定させる効果がある</text>
</svg>`,
    diagramLabel: "RMSNorm の計算ステップ"
  },

  // ===== Section 5: CausalSelfAttention =====
  {
    id: "attention",
    title: "CausalSelfAttention（因果的自己注意機構）",
    lineRange: "51-81行目",
    code: `class CausalSelfAttention(nn.Module):
    def __init__(self):
        super().__init__()
        self.wq = nn.Linear(n_embd, n_embd, bias=False)
        self.wk = nn.Linear(n_embd, n_embd, bias=False)
        self.wv = nn.Linear(n_embd, n_embd, bias=False)
        self.wo = nn.Linear(n_embd, n_embd, bias=False)

    def forward(self, x):
        T, C = x.shape
        q = self.wq(x)  # Query
        k = self.wk(x)  # Key
        v = self.wv(x)  # Value
        # reshape: (T,C) -> (n_head, T, head_dim)
        q = q.view(T, n_head, head_dim).transpose(0, 1)
        k = k.view(T, n_head, head_dim).transpose(0, 1)
        v = v.view(T, n_head, head_dim).transpose(0, 1)
        # attention score
        attn = (q @ k.transpose(-2, -1)) / (head_dim ** 0.5)
        mask = torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)
        attn = attn.masked_fill(mask, float('-inf'))
        attn = F.softmax(attn, dim=-1)
        # weighted sum
        out = attn @ v
        out = out.transpose(0, 1).contiguous().view(T, C)
        return self.wo(out)`,
    explanation: [
      "これがTransformerの<strong>心臓部</strong>です。「各トークンが、他のどのトークンにどれだけ注目するか」を計算します。",
      "<strong>Q（Query）, K（Key）, V（Value）</strong>の3つの行列を使います。図書館に例えると、Qは「質問」、Kは「本の索引」、Vは「本の内容」です。QとKの類似度で検索し、類似度に応じてVから情報を取得します。",
      "<strong>マルチヘッド</strong>: アテンションを4つの「頭」に分割し、それぞれ異なる関係性を並列で学習します。「文字の並び順」「母音・子音パターン」などを別々に捉えられます。",
      "<strong>因果マスク（Causal Mask）</strong>: 未来のトークンを参照できないようにする三角行列のマスクです。GPTは「次の文字を予測する」タスクなので、答えを先に見ることはできません。",
      "最後に <code>wo</code>（出力射影）で4つのヘッドの結果を統合します。"
    ],
    keyPoint: "Self-Attentionは「どの文字がどの文字に関連するか」を動的に計算します。固定パターンではなく、入力に応じて注目先が変わるのがポイントです。",
    diagram: `<svg viewBox="0 0 620 380" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: sans-serif; fill: #e2e4ed; }
    .label { font-size: 11px; fill: #8b8fa8; }
    .val { font-size: 13px; font-family: monospace; }
    .box { fill: #232734; stroke: #2e3348; stroke-width: 1.5; rx: 8; }
    .q-box { fill: #1e2a3d; stroke: #6c8cff; stroke-width: 1.5; rx: 8; }
    .k-box { fill: #2d2a1e; stroke: #fb923c; stroke-width: 1.5; rx: 8; }
    .v-box { fill: #1e2d1e; stroke: #4ade80; stroke-width: 1.5; rx: 8; }
    .mask-box { fill: #2d1e1e; stroke: #f472b6; stroke-width: 1.5; rx: 8; }
    .arrow { stroke: #6c8cff; stroke-width: 1.5; fill: none; marker-end: url(#ah5); }
  </style>
  <defs>
    <marker id="ah5" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
      <polygon points="0 0, 7 2.5, 0 5" fill="#6c8cff"/>
    </marker>
  </defs>

  <!-- Input -->
  <rect class="box" x="230" y="5" width="160" height="40"/>
  <text x="310" y="30" text-anchor="middle" font-size="13">入力 x  (T, 16)</text>

  <!-- Q K V -->
  <path class="arrow" d="M260,45 L160,70"/>
  <path class="arrow" d="M310,45 L310,70"/>
  <path class="arrow" d="M360,45 L460,70"/>

  <rect class="q-box" x="90" y="75" width="130" height="40"/>
  <text x="155" y="100" text-anchor="middle" font-size="13" fill="#6c8cff">Q = Wq(x)</text>

  <rect class="k-box" x="245" y="75" width="130" height="40"/>
  <text x="310" y="100" text-anchor="middle" font-size="13" fill="#fb923c">K = Wk(x)</text>

  <rect class="v-box" x="400" y="75" width="130" height="40"/>
  <text x="465" y="100" text-anchor="middle" font-size="13" fill="#4ade80">V = Wv(x)</text>

  <!-- Multi-head reshape -->
  <path class="arrow" d="M155,115 L155,140"/>
  <path class="arrow" d="M310,115 L310,140"/>
  <path class="arrow" d="M465,115 L465,140"/>

  <text class="label" x="310" y="137" text-anchor="middle">reshape → (4ヘッド, T, 4次元)</text>

  <!-- Attention score -->
  <path class="arrow" d="M155,145 L230,175"/>
  <path class="arrow" d="M310,145 L270,175"/>

  <rect class="q-box" x="170" y="178" width="180" height="40"/>
  <text x="260" y="198" text-anchor="middle" font-size="12">QK<tspan font-size="9" dy="-5">T</tspan><tspan dy="5"> / √head_dim</tspan></text>
  <text class="label" x="260" y="213" text-anchor="middle">注意スコア計算</text>

  <!-- Mask -->
  <path class="arrow" d="M260,220 L260,240"/>
  <rect class="mask-box" x="170" y="245" width="180" height="55"/>
  <text x="260" y="265" text-anchor="middle" font-size="12" fill="#f472b6">因果マスク適用</text>
  <text class="val" x="260" y="285" text-anchor="middle" font-size="10" fill="#f472b6">未来のトークン → -∞</text>

  <!-- Softmax -->
  <path class="arrow" d="M260,300 L260,315"/>
  <rect class="box" x="200" y="318" width="120" height="30"/>
  <text x="260" y="338" text-anchor="middle" font-size="12">softmax</text>

  <!-- attn @ V -->
  <path class="arrow" d="M260,348 L380,348"/>
  <path class="arrow" d="M465,145 L465,340 L420,348"/>

  <rect class="v-box" x="390" y="330" width="140" height="38"/>
  <text x="460" y="354" text-anchor="middle" font-size="12" fill="#4ade80">attn × V</text>

  <!-- Output -->
  <path class="arrow" d="M530,348 L555,348"/>
  <rect class="box" x="558" y="332" width="55" height="35"/>
  <text x="585" y="354" text-anchor="middle" font-size="12">Wo</text>

  <!-- Mask detail -->
  <rect class="mask-box" x="420" y="228" width="170" height="80"/>
  <text class="label" x="505" y="248" text-anchor="middle" fill="#f472b6">因果マスク例 (T=4)</text>
  <text class="val" x="505" y="268" text-anchor="middle" font-size="11">0  -∞  -∞  -∞</text>
  <text class="val" x="505" y="282" text-anchor="middle" font-size="11">0   0  -∞  -∞</text>
  <text class="val" x="505" y="296" text-anchor="middle" font-size="11">0   0   0  -∞</text>
</svg>`,
    diagramLabel: "Self-Attention の全体フロー（Q, K, V → マスク → 出力）"
  },

  // ===== Section 6: MLP =====
  {
    id: "mlp",
    title: "MLP（フィードフォワードネットワーク）",
    lineRange: "84-91行目",
    code: `class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(n_embd, 4 * n_embd, bias=False)
        self.fc2 = nn.Linear(4 * n_embd, n_embd, bias=False)

    def forward(self, x):
        return self.fc2(F.relu(self.fc1(x)))`,
    explanation: [
      "<strong>MLP</strong>（Multi-Layer Perceptron）は、Attention層で集めた情報を<strong>「加工・変換」</strong>するための全結合層です。",
      "構造はシンプル: まず <code>fc1</code> で次元を<strong>4倍に拡大</strong>（16→64）し、<strong>ReLU</strong>を通してから、<code>fc2</code> で<strong>元の次元に戻す</strong>（64→16）。",
      "<strong>ReLU</strong>は「負の値を0にする」活性化関数です。これにより非線形性が導入され、単なる線形変換では表現できないパターンを学習できます。",
      "なぜ一度4倍に広げるのか？ 高次元空間では情報をより豊富に表現でき、複雑なパターンを捉えやすくなるためです。"
    ],
    keyPoint: "Attentionが「どの情報を集めるか」を決め、MLPが「集めた情報をどう解釈するか」を担当します。この役割分担がTransformerの強さの秘密です。",
    diagram: `<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: sans-serif; fill: #e2e4ed; }
    .label { font-size: 11px; fill: #8b8fa8; }
    .box { fill: #232734; stroke: #2e3348; stroke-width: 1.5; rx: 8; }
    .fc-box { fill: #1e2a3d; stroke: #82aaff; stroke-width: 1.5; rx: 8; }
    .relu-box { fill: #2d2a1e; stroke: #fb923c; stroke-width: 2; rx: 20; }
    .arrow { stroke: #6c8cff; stroke-width: 2; fill: none; marker-end: url(#ah6); }
    .dim { font-size: 12px; font-family: monospace; fill: #22d3ee; }
  </style>
  <defs>
    <marker id="ah6" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6c8cff"/>
    </marker>
  </defs>
  <!-- Input -->
  <rect class="box" x="15" y="50" width="80" height="50"/>
  <text x="55" y="72" text-anchor="middle" font-size="13">入力</text>
  <text class="dim" x="55" y="90" text-anchor="middle">(T, 16)</text>
  <!-- fc1 -->
  <path class="arrow" d="M100,75 L130,75"/>
  <rect class="fc-box" x="135" y="45" width="90" height="60"/>
  <text x="180" y="72" text-anchor="middle" font-size="13" fill="#82aaff">fc1</text>
  <text class="label" x="180" y="90" text-anchor="middle">16 → 64</text>
  <!-- Expanded -->
  <path class="arrow" d="M230,75 L260,75"/>
  <text class="dim" x="252" y="60" text-anchor="middle">(T, 64)</text>
  <!-- ReLU -->
  <rect class="relu-box" x="265" y="50" width="80" height="50"/>
  <text x="305" y="80" text-anchor="middle" font-size="14" fill="#fb923c">ReLU</text>
  <!-- fc2 -->
  <path class="arrow" d="M350,75 L380,75"/>
  <rect class="fc-box" x="385" y="45" width="90" height="60"/>
  <text x="430" y="72" text-anchor="middle" font-size="13" fill="#82aaff">fc2</text>
  <text class="label" x="430" y="90" text-anchor="middle">64 → 16</text>
  <!-- Output -->
  <path class="arrow" d="M480,75 L510,75"/>
  <rect class="box" x="515" y="50" width="80" height="50"/>
  <text x="555" y="72" text-anchor="middle" font-size="13">出力</text>
  <text class="dim" x="555" y="90" text-anchor="middle">(T, 16)</text>

  <!-- ReLU graph -->
  <rect class="box" x="190" y="125" width="220" height="50"/>
  <text class="label" x="300" y="143" text-anchor="middle">ReLU: 負の値を0に、正の値はそのまま通す</text>
  <text font-family="monospace" font-size="12" x="300" y="163" text-anchor="middle">
    [-2, 3, -1, 5] → [<tspan fill="#546e7a">0</tspan>, <tspan fill="#4ade80">3</tspan>, <tspan fill="#546e7a">0</tspan>, <tspan fill="#4ade80">5</tspan>]
  </text>
</svg>`,
    diagramLabel: "MLP: 拡大 → 活性化 → 縮小 の流れ"
  },

  // ===== Section 7: TransformerBlock =====
  {
    id: "transformer-block",
    title: "TransformerBlock（残差接続付きブロック）",
    lineRange: "94-105行目",
    code: `class TransformerBlock(nn.Module):
    def __init__(self):
        super().__init__()
        self.norm1 = RMSNorm(n_embd)
        self.attn = CausalSelfAttention()
        self.norm2 = RMSNorm(n_embd)
        self.mlp = MLP()

    def forward(self, x):
        x = x + self.attn(self.norm1(x))  # 残差接続 + Attention
        x = x + self.mlp(self.norm2(x))   # 残差接続 + MLP
        return x`,
    explanation: [
      "<strong>TransformerBlock</strong>は、ここまでに学んだ部品を1つにまとめた「ブロック」です。",
      "処理の流れ: ① RMSNorm → Attention → <strong>残差接続</strong>（元の入力を足す） → ② RMSNorm → MLP → <strong>残差接続</strong>",
      "<strong>残差接続（Residual Connection）</strong>が重要なポイントです。<code>x = x + f(x)</code> という形で、変換結果を<strong>元の入力に足し算</strong>します。",
      "なぜ足し算？ 層を何十も重ねると、勾配が消えて学習が進まなくなります。残差接続があると情報が「ショートカット」で流れるため、<strong>深いネットワークでも安定して学習</strong>できます。"
    ],
    keyPoint: "「正規化 → 変換 → 残差接続」というパターンはモダンなTransformerの標準構成です（Pre-Norm方式）。このブロックを積み重ねることで、より複雑なパターンを学習できます。",
    diagram: `<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: sans-serif; fill: #e2e4ed; }
    .label { font-size: 11px; fill: #8b8fa8; }
    .box { fill: #232734; stroke: #2e3348; stroke-width: 1.5; rx: 8; }
    .norm-box { fill: #1e2d1e; stroke: #4ade80; stroke-width: 1.5; rx: 8; }
    .attn-box { fill: #1e2a3d; stroke: #6c8cff; stroke-width: 1.5; rx: 8; }
    .mlp-box { fill: #2d2a1e; stroke: #fb923c; stroke-width: 1.5; rx: 8; }
    .add-circle { fill: #2d1f3d; stroke: #c792ea; stroke-width: 2; }
    .arrow { stroke: #6c8cff; stroke-width: 2; fill: none; marker-end: url(#ah7); }
    .skip { stroke: #c792ea; stroke-width: 2; stroke-dasharray: 6,3; fill: none; marker-end: url(#ah7p); }
  </style>
  <defs>
    <marker id="ah7" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6c8cff"/>
    </marker>
    <marker id="ah7p" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#c792ea"/>
    </marker>
  </defs>

  <!-- Title -->
  <text class="label" x="300" y="18" text-anchor="middle">TransformerBlock の内部構造</text>

  <!-- Input -->
  <rect class="box" x="240" y="28" width="120" height="35"/>
  <text x="300" y="50" text-anchor="middle" font-size="13">入力 x</text>

  <!-- Norm1 -->
  <path class="arrow" d="M300,63 L300,80"/>
  <rect class="norm-box" x="240" y="83" width="120" height="35"/>
  <text x="300" y="105" text-anchor="middle" font-size="13" fill="#4ade80">RMSNorm</text>

  <!-- Attention -->
  <path class="arrow" d="M300,118 L300,135"/>
  <rect class="attn-box" x="220" y="138" width="160" height="35"/>
  <text x="300" y="160" text-anchor="middle" font-size="13" fill="#6c8cff">Self-Attention</text>

  <!-- Add 1 -->
  <path class="arrow" d="M300,173 L300,190"/>
  <circle class="add-circle" cx="300" cy="205" r="15"/>
  <text x="300" y="210" text-anchor="middle" font-size="16" font-weight="bold" fill="#c792ea">+</text>

  <!-- Skip connection 1 -->
  <path class="skip" d="M240,45 L140,45 L140,205 L282,205"/>
  <text class="label" x="110" y="130" text-anchor="middle" fill="#c792ea" transform="rotate(-90, 110, 130)">残差接続</text>

  <!-- Norm2 -->
  <path class="arrow" d="M300,220 L300,237"/>
  <rect class="norm-box" x="240" y="240" width="120" height="35"/>
  <text x="300" y="262" text-anchor="middle" font-size="13" fill="#4ade80">RMSNorm</text>

  <!-- MLP -->
  <path class="arrow" d="M300,275 L300,290"/>
  <rect class="mlp-box" x="250" y="293" width="100" height="35"/>
  <text x="300" y="315" text-anchor="middle" font-size="13" fill="#fb923c">MLP</text>

  <!-- Add 2 -->
  <path class="arrow" d="M300,328 L300,345"/>
  <circle class="add-circle" cx="300" cy="360" r="15"/>
  <text x="300" y="365" text-anchor="middle" font-size="16" font-weight="bold" fill="#c792ea">+</text>

  <!-- Skip connection 2 -->
  <path class="skip" d="M240,205 L175,205 L175,360 L282,360"/>
  <text class="label" x="147" y="285" text-anchor="middle" fill="#c792ea" transform="rotate(-90, 147, 285)">残差接続</text>

  <!-- Output -->
  <rect class="box" x="430" y="345" width="100" height="35"/>
  <text x="480" y="367" text-anchor="middle" font-size="13">出力</text>
  <path class="arrow" d="M318,360 L425,360"/>
</svg>`,
    diagramLabel: "残差接続（紫の破線）で入力が直接出力へ流れる"
  },

  // ===== Section 8: GPT Model =====
  {
    id: "gpt",
    title: "GPTモデル全体の構成",
    lineRange: "108-126行目",
    code: `class GPT(nn.Module):
    def __init__(self):
        super().__init__()
        self.wte = nn.Embedding(vocab_size, n_embd)   # トークン埋め込み
        self.wpe = nn.Embedding(block_size, n_embd)    # 位置埋め込み
        self.norm = RMSNorm(n_embd)
        self.layers = nn.ModuleList(
            [TransformerBlock() for _ in range(n_layer)]
        )
        self.lm_head = nn.Linear(n_embd, vocab_size, bias=False)

    def forward(self, tokens):
        T = tokens.shape[0]
        pos = torch.arange(T)
        x = self.wte(tokens) + self.wpe(pos)  # トークン + 位置
        x = self.norm(x)
        for layer in self.layers:
            x = layer(x)
        logits = self.lm_head(x)  # (T, vocab_size)
        return logits`,
    explanation: [
      "いよいよGPTモデル全体です。すべての部品をここで<strong>組み立て</strong>ます。",
      "<strong>トークン埋め込み（wte）</strong>: 各文字IDを16次元のベクトルに変換します。似た文字は似たベクトルになるように学習されます。",
      "<strong>位置埋め込み（wpe）</strong>: 「この文字は何番目にあるか」という位置情報をベクトルとして追加します。Transformerは順序を持たないため、位置情報を明示的に与える必要があります。",
      "トークン埋め込み + 位置埋め込みを足し合わせた後、RMSNormで正規化し、TransformerBlockを通します。",
      "最後の <code>lm_head</code> は、16次元のベクトルを<strong>語彙サイズの次元に射影</strong>し、「次にどの文字が来る確率が高いか」のスコア（logits）を出力します。"
    ],
    keyPoint: "GPTの全体は意外とシンプルです: 「文字→ベクトル」→「位置情報を足す」→「TransformerBlockで処理」→「次の文字の確率を出す」。これが言語モデルの基本構造です。",
    diagram: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: sans-serif; fill: #e2e4ed; }
    .label { font-size: 11px; fill: #8b8fa8; }
    .box { fill: #232734; stroke: #2e3348; stroke-width: 1.5; rx: 8; }
    .emb-box { fill: #2d1f3d; stroke: #c792ea; stroke-width: 1.5; rx: 8; }
    .block-box { fill: #1e2a3d; stroke: #6c8cff; stroke-width: 2; rx: 10; }
    .head-box { fill: #2d2a1e; stroke: #fb923c; stroke-width: 1.5; rx: 8; }
    .arrow { stroke: #6c8cff; stroke-width: 2; fill: none; marker-end: url(#ah8); }
  </style>
  <defs>
    <marker id="ah8" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6c8cff"/>
    </marker>
  </defs>

  <!-- Title -->
  <text class="label" x="300" y="18" text-anchor="middle">GPTモデルの全体構造</text>

  <!-- Input tokens -->
  <rect class="box" x="80" y="30" width="120" height="35"/>
  <text x="140" y="52" text-anchor="middle" font-size="12">入力トークン</text>
  <text class="label" x="140" y="78" text-anchor="middle">[BOS, a, v, a]</text>

  <rect class="box" x="400" y="30" width="120" height="35"/>
  <text x="460" y="52" text-anchor="middle" font-size="12">位置</text>
  <text class="label" x="460" y="78" text-anchor="middle">[0, 1, 2, 3]</text>

  <!-- Embeddings -->
  <path class="arrow" d="M140,65 L140,95"/>
  <rect class="emb-box" x="70" y="98" width="140" height="40"/>
  <text x="140" y="123" text-anchor="middle" font-size="12" fill="#c792ea">Token Embedding</text>

  <path class="arrow" d="M460,65 L460,95"/>
  <rect class="emb-box" x="390" y="98" width="140" height="40"/>
  <text x="460" y="123" text-anchor="middle" font-size="12" fill="#c792ea">Position Embedding</text>

  <!-- Add -->
  <path class="arrow" d="M210,118 L270,155"/>
  <path class="arrow" d="M390,118 L330,155"/>
  <circle fill="#2d1f3d" stroke="#c792ea" stroke-width="2" cx="300" cy="168" r="14"/>
  <text x="300" y="173" text-anchor="middle" font-size="15" font-weight="bold" fill="#c792ea">+</text>

  <!-- RMSNorm -->
  <path class="arrow" d="M300,182 L300,200"/>
  <rect fill="#1e2d1e" stroke="#4ade80" stroke-width="1.5" rx="8" x="240" y="203" width="120" height="32"/>
  <text x="300" y="224" text-anchor="middle" font-size="12" fill="#4ade80">RMSNorm</text>

  <!-- Transformer Block -->
  <path class="arrow" d="M300,235 L300,258"/>
  <rect class="block-box" x="180" y="260" width="240" height="55"/>
  <text x="300" y="283" text-anchor="middle" font-size="14" fill="#6c8cff">TransformerBlock</text>
  <text class="label" x="300" y="303" text-anchor="middle">Attention + MLP + 残差接続</text>

  <!-- x N layers -->
  <text x="435" y="290" font-size="13" fill="#fb923c">× n_layer (1)</text>

  <!-- lm_head -->
  <path class="arrow" d="M300,315 L300,340"/>
  <rect class="head-box" x="220" y="343" width="160" height="40"/>
  <text x="300" y="368" text-anchor="middle" font-size="12" fill="#fb923c">lm_head (→ vocab_size)</text>

  <!-- Output -->
  <text class="label" x="300" y="400" text-anchor="middle">出力: 各位置での「次の文字」の確率スコア (logits)</text>
</svg>`,
    diagramLabel: "GPT: 埋め込み → Transformerブロック → 次トークン予測"
  },

  // ===== Section 9: Training =====
  {
    id: "training",
    title: "学習ループ",
    lineRange: "129-161行目",
    code: `model = GPT()
for p in model.parameters():
    nn.init.normal_(p, mean=0.0, std=0.08)

optimizer = torch.optim.Adam(model.parameters(),
                             lr=0.01, betas=(0.85, 0.99))
num_steps = 1000

for step in range(num_steps):
    doc = docs[step % len(docs)]
    tokens = [BOS] + [uchars.index(ch) for ch in doc] + [BOS]
    n = min(block_size, len(tokens) - 1)

    input_ids  = torch.tensor(tokens[:n])    # 入力
    target_ids = torch.tensor(tokens[1:n+1]) # 正解

    logits = model(input_ids)
    loss = F.cross_entropy(logits, target_ids)

    optimizer.zero_grad()
    loss.backward()

    # learning rate decay
    lr_t = 0.01 * (1 - step / num_steps)
    for param_group in optimizer.param_groups:
        param_group['lr'] = lr_t

    optimizer.step()`,
    explanation: [
      "ここがモデルの<strong>学習（Training）</strong>部分です。1000ステップにわたり、名前データを使ってモデルを訓練します。",
      "<strong>入力と正解の作り方</strong>: 名前 \"ava\" を <code>[BOS, a, v, a, BOS]</code> とトークン化し、入力は <code>[BOS, a, v, a]</code>、正解は1つズラした <code>[a, v, a, BOS]</code> にします。つまり「<em>各文字の次に来る文字を当てる</em>」タスクです。",
      "<strong>Cross Entropy Loss</strong>: モデルの予測（logits）と正解（target_ids）のズレを数値化します。この値が小さいほど、予測が正確であることを意味します。",
      "<strong>逆伝播（backward）</strong>で勾配を計算し、<strong>optimizer.step()</strong>でパラメータを更新します。学習率は線形に減衰させ、学習の終盤は慎重に微調整します。"
    ],
    keyPoint: "GPTの学習は「次のトークンを予測する」という非常にシンプルなタスクです。この単純なタスクを大量のデータで繰り返すだけで、言語の構造を学習できるのがGPTの核心的アイデアです。",
    diagram: `<svg viewBox="0 0 620 300" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: sans-serif; fill: #e2e4ed; }
    .label { font-size: 11px; fill: #8b8fa8; }
    .box { fill: #232734; stroke: #2e3348; stroke-width: 1.5; rx: 8; }
    .tok { font-size: 15px; font-family: monospace; font-weight: bold; }
    .arrow { stroke: #6c8cff; stroke-width: 2; fill: none; marker-end: url(#ah9); }
    .loss-arrow { stroke: #f472b6; stroke-width: 2; stroke-dasharray: 5,3; fill: none; marker-end: url(#ah9p); }
  </style>
  <defs>
    <marker id="ah9" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6c8cff"/>
    </marker>
    <marker id="ah9p" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#f472b6"/>
    </marker>
  </defs>

  <text class="label" x="310" y="18" text-anchor="middle">「次の文字を予測する」タスク（例: "ava"）</text>

  <!-- Input tokens -->
  <text class="label" x="50" y="48">入力:</text>
  <rect class="box" x="100" y="32" width="55" height="35"/>
  <text class="tok" x="127" y="55" text-anchor="middle" fill="#c792ea">BOS</text>
  <rect class="box" x="170" y="32" width="55" height="35"/>
  <text class="tok" x="197" y="55" text-anchor="middle">a</text>
  <rect class="box" x="240" y="32" width="55" height="35"/>
  <text class="tok" x="267" y="55" text-anchor="middle">v</text>
  <rect class="box" x="310" y="32" width="55" height="35"/>
  <text class="tok" x="337" y="55" text-anchor="middle">a</text>

  <!-- Arrows down -->
  <path class="arrow" d="M127,67 L127,85"/>
  <path class="arrow" d="M197,67 L197,85"/>
  <path class="arrow" d="M267,67 L267,85"/>
  <path class="arrow" d="M337,67 L337,85"/>

  <!-- GPT box -->
  <rect fill="#1e2a3d" stroke="#6c8cff" stroke-width="2" rx="10" x="85" y="88" width="295" height="40"/>
  <text x="232" y="113" text-anchor="middle" font-size="14" fill="#6c8cff">GPTモデル</text>

  <!-- Arrows down -->
  <path class="arrow" d="M127,128 L127,148"/>
  <path class="arrow" d="M197,128 L197,148"/>
  <path class="arrow" d="M267,128 L267,148"/>
  <path class="arrow" d="M337,128 L337,148"/>

  <!-- Predictions -->
  <text class="label" x="50" y="168">予測:</text>
  <rect fill="#1e2d1e" stroke="#4ade80" stroke-width="1.5" rx="8" x="100" y="150" width="55" height="30"/>
  <text font-size="12" x="127" y="170" text-anchor="middle" fill="#4ade80">a?</text>
  <rect fill="#1e2d1e" stroke="#4ade80" stroke-width="1.5" rx="8" x="170" y="150" width="55" height="30"/>
  <text font-size="12" x="197" y="170" text-anchor="middle" fill="#4ade80">v?</text>
  <rect fill="#1e2d1e" stroke="#4ade80" stroke-width="1.5" rx="8" x="240" y="150" width="55" height="30"/>
  <text font-size="12" x="267" y="170" text-anchor="middle" fill="#4ade80">a?</text>
  <rect fill="#1e2d1e" stroke="#4ade80" stroke-width="1.5" rx="8" x="310" y="150" width="55" height="30"/>
  <text font-size="12" x="337" y="170" text-anchor="middle" fill="#4ade80">BOS?</text>

  <!-- Target -->
  <text class="label" x="50" y="210">正解:</text>
  <rect fill="#2d1e1e" stroke="#f472b6" stroke-width="1.5" rx="8" x="100" y="195" width="55" height="30"/>
  <text font-size="14" x="127" y="215" text-anchor="middle" fill="#f472b6" font-weight="bold">a</text>
  <rect fill="#2d1e1e" stroke="#f472b6" stroke-width="1.5" rx="8" x="170" y="195" width="55" height="30"/>
  <text font-size="14" x="197" y="215" text-anchor="middle" fill="#f472b6" font-weight="bold">v</text>
  <rect fill="#2d1e1e" stroke="#f472b6" stroke-width="1.5" rx="8" x="240" y="195" width="55" height="30"/>
  <text font-size="14" x="267" y="215" text-anchor="middle" fill="#f472b6" font-weight="bold">a</text>
  <rect fill="#2d1e1e" stroke="#f472b6" stroke-width="1.5" rx="8" x="310" y="195" width="55" height="30"/>
  <text font-size="14" x="337" y="215" text-anchor="middle" fill="#f472b6" font-weight="bold">BOS</text>

  <!-- Loss -->
  <path class="loss-arrow" d="M232,180 L450,180 L450,108 L385,108"/>
  <rect fill="#2d1f3d" stroke="#f472b6" stroke-width="1.5" rx="8" x="420" y="88" width="170" height="40"/>
  <text x="505" y="108" text-anchor="middle" font-size="12" fill="#f472b6">Cross Entropy Loss</text>
  <text class="label" x="505" y="122" text-anchor="middle">予測と正解のズレ</text>

  <!-- Learning loop -->
  <rect class="box" x="100" y="245" width="460" height="45"/>
  <text x="330" y="262" text-anchor="middle" font-size="12">
    <tspan fill="#6c8cff">①予測</tspan> → <tspan fill="#f472b6">②損失計算</tspan> → <tspan fill="#fb923c">③勾配計算(backward)</tspan> → <tspan fill="#4ade80">④パラメータ更新(step)</tspan>
  </text>
  <text class="label" x="330" y="280" text-anchor="middle">この4ステップを1000回繰り返す</text>
</svg>`,
    diagramLabel: "学習ループ: 入力→予測→正解と比較→パラメータ更新"
  },

  // ===== Section 10: Inference =====
  {
    id: "inference",
    title: "推論（名前の生成）",
    lineRange: "163-182行目",
    code: `temperature = 0.5
model.eval()
with torch.no_grad():
    for sample_idx in range(20):
        token_id = BOS
        sample = []
        input_ids = []
        for pos_id in range(block_size):
            input_ids.append(token_id)
            tokens_t = torch.tensor(input_ids)
            logits = model(tokens_t)
            logits_last = logits[-1] / temperature
            probs = F.softmax(logits_last, dim=-1)
            token_id = torch.multinomial(probs, 1).item()
            if token_id == BOS:
                break
            sample.append(uchars[token_id])
        print(f"sample: {''.join(sample)}")`,
    explanation: [
      "学習が終わったら、モデルに<strong>新しい名前を生成</strong>させます。これが「推論（Inference）」です。",
      "手順: ① BOSトークン（開始記号）から始める → ② モデルに「次の文字は何？」と聞く → ③ 確率に基づいてランダムに1文字選ぶ → ④ 選んだ文字を入力に追加して②に戻る → ⑤ BOSが出たら名前完成",
      "<strong>temperature（温度）</strong>はランダム性を制御するパラメータです。低い値（0.5）だと<strong>確率の高い文字が選ばれやすく</strong>なり、自然な名前になります。高い値だと多様だが奇妙な名前が出やすくなります。",
      "<code>model.eval()</code> と <code>torch.no_grad()</code> は、推論時に不要な計算（勾配計算など）をオフにして効率化するためのおまじないです。"
    ],
    keyPoint: "GPTの生成は「1文字ずつ順に予測する」自己回帰（autoregressive）方式です。ChatGPTも同じ仕組みで、1トークンずつテキストを生成しています。",
    diagram: `<svg viewBox="0 0 620 260" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: sans-serif; fill: #e2e4ed; }
    .label { font-size: 11px; fill: #8b8fa8; }
    .tok { font-size: 16px; font-family: monospace; font-weight: bold; }
    .box { fill: #232734; stroke: #2e3348; stroke-width: 1.5; rx: 8; }
    .gen { fill: #1e2d1e; stroke: #4ade80; stroke-width: 2; rx: 8; }
    .arrow { stroke: #6c8cff; stroke-width: 2; fill: none; marker-end: url(#ah10); }
    .loop { stroke: #fb923c; stroke-width: 2; stroke-dasharray: 5,3; fill: none; marker-end: url(#ah10o); }
  </style>
  <defs>
    <marker id="ah10" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6c8cff"/>
    </marker>
    <marker id="ah10o" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#fb923c"/>
    </marker>
  </defs>

  <text class="label" x="310" y="18" text-anchor="middle">自己回帰的な文字生成プロセス（例）</text>

  <!-- Step 1 -->
  <text class="label" x="30" y="55">Step 1:</text>
  <rect fill="#2d1f3d" stroke="#c792ea" stroke-width="1.5" rx="8" x="90" y="38" width="50" height="32"/>
  <text class="tok" x="115" y="60" text-anchor="middle" fill="#c792ea">BOS</text>
  <path class="arrow" d="M145,54 L180,54"/>
  <rect class="box" x="185" y="38" width="60" height="32"/>
  <text x="215" y="58" text-anchor="middle" font-size="11">GPT</text>
  <path class="arrow" d="M250,54 L280,54"/>
  <rect class="gen" x="285" y="38" width="45" height="32"/>
  <text class="tok" x="307" y="59" text-anchor="middle" fill="#4ade80">e</text>

  <!-- Step 2 -->
  <text class="label" x="30" y="100">Step 2:</text>
  <rect fill="#2d1f3d" stroke="#c792ea" stroke-width="1.5" rx="8" x="90" y="83" width="50" height="32"/>
  <text class="tok" x="115" y="105" text-anchor="middle" fill="#c792ea">BOS</text>
  <rect class="gen" x="145" y="83" width="45" height="32"/>
  <text class="tok" x="167" y="104" text-anchor="middle" fill="#4ade80">e</text>
  <path class="arrow" d="M195,99 L225,99"/>
  <rect class="box" x="230" y="83" width="60" height="32"/>
  <text x="260" y="103" text-anchor="middle" font-size="11">GPT</text>
  <path class="arrow" d="M295,99 L325,99"/>
  <rect class="gen" x="330" y="83" width="45" height="32"/>
  <text class="tok" x="352" y="104" text-anchor="middle" fill="#4ade80">m</text>

  <!-- Step 3 -->
  <text class="label" x="30" y="145">Step 3:</text>
  <rect fill="#2d1f3d" stroke="#c792ea" stroke-width="1.5" rx="8" x="90" y="128" width="50" height="32"/>
  <text class="tok" x="115" y="150" text-anchor="middle" fill="#c792ea">BOS</text>
  <rect class="gen" x="145" y="128" width="40" height="32"/>
  <text class="tok" x="165" y="149" text-anchor="middle" fill="#4ade80">e</text>
  <rect class="gen" x="190" y="128" width="42" height="32"/>
  <text class="tok" x="211" y="149" text-anchor="middle" fill="#4ade80">m</text>
  <path class="arrow" d="M237,144 L267,144"/>
  <rect class="box" x="272" y="128" width="60" height="32"/>
  <text x="302" y="148" text-anchor="middle" font-size="11">GPT</text>
  <path class="arrow" d="M337,144 L367,144"/>
  <rect class="gen" x="372" y="128" width="42" height="32"/>
  <text class="tok" x="393" y="149" text-anchor="middle" fill="#4ade80">m</text>

  <!-- Step 4 -->
  <text class="label" x="30" y="190">Step 4:</text>
  <rect fill="#2d1f3d" stroke="#c792ea" stroke-width="1.5" rx="8" x="90" y="173" width="50" height="32"/>
  <text class="tok" x="115" y="195" text-anchor="middle" fill="#c792ea">BOS</text>
  <rect class="gen" x="145" y="173" width="40" height="32"/>
  <text class="tok" x="165" y="194" text-anchor="middle" fill="#4ade80">e</text>
  <rect class="gen" x="190" y="173" width="42" height="32"/>
  <text class="tok" x="211" y="194" text-anchor="middle" fill="#4ade80">m</text>
  <rect class="gen" x="237" y="173" width="42" height="32"/>
  <text class="tok" x="258" y="194" text-anchor="middle" fill="#4ade80">m</text>
  <path class="arrow" d="M284,189 L314,189"/>
  <rect class="box" x="319" y="173" width="60" height="32"/>
  <text x="349" y="193" text-anchor="middle" font-size="11">GPT</text>
  <path class="arrow" d="M384,189 L410,189"/>
  <rect class="gen" x="415" y="173" width="40" height="32"/>
  <text class="tok" x="435" y="194" text-anchor="middle" fill="#4ade80">a</text>

  <!-- Result -->
  <rect class="box" x="120" y="222" width="370" height="35"/>
  <text x="305" y="244" text-anchor="middle" font-size="14">
    生成結果: <tspan fill="#4ade80" font-weight="bold" font-size="18">"emma"</tspan>
    <tspan font-size="11" fill="#8b8fa8">（次のステップでBOSが出て終了）</tspan>
  </text>
</svg>`,
    diagramLabel: "自己回帰生成: 1文字ずつ予測し、入力に追加していく"
  }
];
