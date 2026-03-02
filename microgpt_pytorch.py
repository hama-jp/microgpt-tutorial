"""
PyTorch version of microgpt.py — a minimal GPT for training and inference on name generation.
Same architecture as the pure Python version, rewritten with PyTorch for clarity.

Original pure Python version by @karpathy
"""

import os
import random
import torch
import torch.nn as nn
import torch.nn.functional as F

torch.manual_seed(42)
random.seed(42)

# --- Data ---
if not os.path.exists('input.txt'):
    import urllib.request
    names_url = 'https://raw.githubusercontent.com/karpathy/makemore/refs/heads/master/names.txt'
    urllib.request.urlretrieve(names_url, 'input.txt')
docs = [l.strip() for l in open('input.txt').read().strip().split('\n') if l.strip()]
random.shuffle(docs)
print(f"num docs: {len(docs)}")

# --- Tokenizer ---
uchars = sorted(set(''.join(docs)))
BOS = len(uchars)
vocab_size = len(uchars) + 1
print(f"vocab size: {vocab_size}")

# --- Model ---
n_embd = 16
n_head = 4
n_layer = 1
block_size = 16
head_dim = n_embd // n_head


class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-5):
        super().__init__()
        self.eps = eps

    def forward(self, x):
        # x: (..., dim)
        ms = (x * x).mean(dim=-1, keepdim=True)
        return x * torch.rsqrt(ms + self.eps)


class CausalSelfAttention(nn.Module):
    def __init__(self):
        super().__init__()
        self.wq = nn.Linear(n_embd, n_embd, bias=False)
        self.wk = nn.Linear(n_embd, n_embd, bias=False)
        self.wv = nn.Linear(n_embd, n_embd, bias=False)
        self.wo = nn.Linear(n_embd, n_embd, bias=False)

    def forward(self, x):
        # x: (T, C)
        T, C = x.shape
        q = self.wq(x)  # (T, C)
        k = self.wk(x)  # (T, C)
        v = self.wv(x)  # (T, C)

        # reshape into (n_head, T, head_dim)
        q = q.view(T, n_head, head_dim).transpose(0, 1)  # (n_head, T, head_dim)
        k = k.view(T, n_head, head_dim).transpose(0, 1)
        v = v.view(T, n_head, head_dim).transpose(0, 1)

        # attention: (n_head, T, T)
        attn = (q @ k.transpose(-2, -1)) / (head_dim ** 0.5)
        # causal mask: prevent attending to future tokens
        mask = torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)
        attn = attn.masked_fill(mask, float('-inf'))
        attn = F.softmax(attn, dim=-1)

        # weighted sum of values
        out = attn @ v  # (n_head, T, head_dim)
        out = out.transpose(0, 1).contiguous().view(T, C)  # (T, C)
        return self.wo(out)


class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(n_embd, 4 * n_embd, bias=False)
        self.fc2 = nn.Linear(4 * n_embd, n_embd, bias=False)

    def forward(self, x):
        return self.fc2(F.relu(self.fc1(x)))


class TransformerBlock(nn.Module):
    def __init__(self):
        super().__init__()
        self.norm1 = RMSNorm(n_embd)
        self.attn = CausalSelfAttention()
        self.norm2 = RMSNorm(n_embd)
        self.mlp = MLP()

    def forward(self, x):
        x = x + self.attn(self.norm1(x))
        x = x + self.mlp(self.norm2(x))
        return x


class GPT(nn.Module):
    def __init__(self):
        super().__init__()
        self.wte = nn.Embedding(vocab_size, n_embd)
        self.wpe = nn.Embedding(block_size, n_embd)
        self.norm = RMSNorm(n_embd)
        self.layers = nn.ModuleList([TransformerBlock() for _ in range(n_layer)])
        self.lm_head = nn.Linear(n_embd, vocab_size, bias=False)

    def forward(self, tokens):
        # tokens: (T,) integer tensor
        T = tokens.shape[0]
        pos = torch.arange(T)
        x = self.wte(tokens) + self.wpe(pos)  # (T, C)
        x = self.norm(x)
        for layer in self.layers:
            x = layer(x)
        logits = self.lm_head(x)  # (T, vocab_size)
        return logits


# --- Initialize ---
model = GPT()
# Match the original's small init std
for p in model.parameters():
    nn.init.normal_(p, mean=0.0, std=0.08)
print(f"num params: {sum(p.numel() for p in model.parameters())}")

# --- Training ---
optimizer = torch.optim.Adam(model.parameters(), lr=0.01, betas=(0.85, 0.99), eps=1e-8)
num_steps = 1000

for step in range(num_steps):
    doc = docs[step % len(docs)]
    tokens = [BOS] + [uchars.index(ch) for ch in doc] + [BOS]
    n = min(block_size, len(tokens) - 1)

    input_ids = torch.tensor(tokens[:n], dtype=torch.long)    # (n,)
    target_ids = torch.tensor(tokens[1:n+1], dtype=torch.long) # (n,)

    logits = model(input_ids)  # (n, vocab_size)
    loss = F.cross_entropy(logits, target_ids)

    optimizer.zero_grad()
    loss.backward()

    # linear learning rate decay
    lr_t = 0.01 * (1 - step / num_steps)
    for param_group in optimizer.param_groups:
        param_group['lr'] = lr_t

    optimizer.step()

    print(f"step {step+1:4d} / {num_steps:4d} | loss {loss.item():.4f}")

# --- Inference ---
temperature = 0.5
print("\n--- inference (new, hallucinated names) ---")
model.eval()
with torch.no_grad():
    for sample_idx in range(20):
        token_id = BOS
        sample = []
        input_ids = []
        for pos_id in range(block_size):
            input_ids.append(token_id)
            tokens_t = torch.tensor(input_ids, dtype=torch.long)
            logits = model(tokens_t)             # (T, vocab_size)
            logits_last = logits[-1] / temperature  # last position only
            probs = F.softmax(logits_last, dim=-1)
            token_id = torch.multinomial(probs, 1).item()
            if token_id == BOS:
                break
            sample.append(uchars[token_id])
        print(f"sample {sample_idx+1:2d}: {''.join(sample)}")
