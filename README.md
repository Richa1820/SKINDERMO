# SKINDERMO — A NOVEL AI-BASED SKIN DISEASE DETECTION SYSTEM
> **Academic Research Prototype** comparing **ResNet-50**, **DenseNet-121**, and **Inception-V3** deep convolutional neural networks for automated dermoscopic skin lesion image classification across the 7 HAM10000 diagnostic categories.

---

## ⚠️ Academic & Medical Disclaimer

> **"SKINDERMO is an academic research prototype for skin-lesion image classification. It is not a medical diagnostic system and must not be used to make diagnosis or treatment decisions."**
>
> The outputs, probabilities, and classifications rendered by this system represent experimental scores from deep learning models. This prototype has class-imbalance limitations and has not been clinically validated. Any suspicious skin lesion must be evaluated in person by a board-certified dermatologist.

---

## 🌟 Key Features

1. **Modern Medical Tech Aesthetic**:
   - Palette: Warm white & light grey backgrounds with deep forest green, emerald, and muted mint accents.
   - Distinctive SKINDERMO custom brand identity (dermoscopic aperture & neural topology emblem).
   - High-contrast charcoal typography using Google Fonts (Plus Jakarta Sans & JetBrains Mono).
   - Custom dermoscopic viewport simulation with animated optical reticle, crosshairs, and spatial scanning.

2. **Comparative Neural Architectures**:
   - **ResNet-50** (`resnet50_best.keras`): 50-layer deep residual learning with skip connections preventing vanishing gradients (224×224 input, 25.6M parameters).
   - **DenseNet-121** (`densenet121_best.keras`): 121-layer densely connected architecture with full layer-to-layer feature reuse (224×224 input, 8.1M parameters).
   - **Inception-V3** (`inceptionv3_best.keras`): Asymmetric factorized convolutions (1×7, 7×1) with multi-scale parallel receptive fields (299×299 input, 23.8M parameters).

3. **7 HAM10000 Diagnostic Classes**:
   - `akiec` — Actinic Keratoses and Intraepithelial Carcinoma (Bowen's disease)
   - `bcc` — Basal Cell Carcinoma
   - `bkl` — Benign Keratosis-like Lesions (solar lentigines, seborrheic keratoses, LPLK)
   - `df` — Dermatofibroma
   - `mel` — Melanoma
   - `nv` — Melanocytic Nevi
   - `vasc` — Vascular Lesions

4. **Image Analysis Workspace**:
   - Drag-and-drop file ingestion (JPG, JPEG, PNG, max 20MB).
   - Client-side image validation, metadata inspection (resolution, file size, MIME type).
   - Interactive dermoscopy reticle overlay with polar coordinate grid toggle.
   - Built-in academic test sample images for instant evaluation.
   - Deep inference forward pass loading animation with latency tracking.
   - Horizontal probability distribution bar chart across all 7 classes.
   - Strict research integrity protocol: never fabricates simulated predictions if backend is unavailable.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend**: Python 3.10+, FastAPI, Uvicorn, TensorFlow / Keras, Pillow, NumPy
- **Dataset Benchmark**: HAM10000 (10,015 dermoscopic training images)

---

## 🚀 Windows Setup & Launch Guide

### 1. Launch the Frontend

Open PowerShell in the project root (`d:\mini-project\SKINDERMO_WEBSITE`):

```powershell
# 1. Install frontend dependencies (if not already installed)
npm install

# 2. Start the Vite development server
npm run dev
```

The application will be accessible at:
👉 **`http://localhost:5173/`**

To test a production build:
```powershell
npm run build
npm run preview
```

---

### 2. Launch the Python FastAPI Backend (Optional / When Ready)

When you download your trained `.keras` model weights from Google Drive:

1. Create a `models` folder inside `backend`:
   ```powershell
   mkdir -p backend/models
   ```
2. Place your three model files into `backend/models/`:
   - `resnet50_best.keras`
   - `densenet121_best.keras`
   - `inceptionv3_best.keras`

3. Install backend dependencies and launch the server:
   ```powershell
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

The backend API will start at:
👉 **`http://localhost:8000`**
- Health Check: `GET http://localhost:8000/api/health`
- Predict Endpoint: `POST http://localhost:8000/api/predict`
- Interactive Swagger Docs: `http://localhost:8000/docs`

---

## 📁 Project Structure

```
SKINDERMO_WEBSITE/
├── index.html                  # HTML entry point with Plus Jakarta Sans & JetBrains Mono
├── package.json                # React 18, Vite, Tailwind, Lucide dependencies
├── tailwind.config.js          # Tailored medical research color tokens & shadows
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite dev server configuration
├── .env                        # VITE_API_BASE_URL=http://localhost:8000
├── public/
│   └── favicon.svg             # Custom dermoscopic aperture & neural motif SVG favicon
├── src/
│   ├── main.tsx                # React root mount
│   ├── App.tsx                 # Core application layout & scroll coordinator
│   ├── index.css               # Tailwind directives & optical scan micro-animations
│   ├── vite-env.d.ts           # Environment type definitions
│   ├── types/
│   │   └── index.ts            # Complete TypeScript interfaces for models & predictions
│   ├── constants/
│   │   └── models.ts           # Architecture specifications, 7 classes metadata, disclaimer
│   ├── services/
│   │   └── api.ts              # Real API client calling POST /api/predict & health probes
│   └── components/
│       ├── Navbar.tsx          # Navigation header with live API status & mobile drawer
│       ├── Hero.tsx            # Headline, stats, and custom dermoscopic visual composition
│       ├── ModelCards.tsx      # ResNet50, DenseNet121, InceptionV3 comparative cards
│       ├── Methodology.tsx     # 3-step pipeline (Upload, Analyze, Review)
│       ├── DatasetClasses.tsx  # Interactive 7-class HAM10000 taxonomy inspector
│       ├── Limitations.tsx     # Class imbalance analysis & academic medical disclaimer
│       ├── Footer.tsx          # Citation, copyright, and research notices
│       ├── UI/
│       │   ├── BrandLogo.tsx   # Custom SKINDERMO aperture & neural topology logo
│       │   └── Badge.tsx       # Reusable status tags and severity badges
│       └── Workspace/
│           ├── WorkspaceHeader.tsx         # Breadcrumbs, model pill, connection status
│           ├── ModelSelector.tsx           # Interactive 3-model selection cards
│           ├── ImageDropzone.tsx           # Drag & drop upload, validation, sample buttons
│           ├── ImagePreview.tsx            # Dermoscopy preview, reticle grid toggle
│           ├── InferenceState.tsx          # Multi-stage neural forward pass animation
│           ├── ConnectionErrorCard.tsx     # Offline guidance with copyable commands
│           ├── ClassDistributionChart.tsx  # 7-class horizontal probability bar chart
│           ├── ResultsDisplay.tsx          # Predicted class, estimated score, JSON export
│           └── AnalysisWorkspace.tsx       # Main workspace state container
└── backend/
    ├── main.py                 # FastAPI backend with POST /api/predict & preprocessing
    ├── requirements.txt        # FastAPI, Uvicorn, TensorFlow, Pillow, NumPy
    └── models/
        └── README.md           # Instructions for placing .keras weight files
```

---

## 🔬 Benchmark Dataset Citation

> Tschandl, P., Rosendahl, C. & Kittler, H. **The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions.** *Sci Data* 5, 180161 (2018). https://doi.org/10.1038/sdata.2018.161
