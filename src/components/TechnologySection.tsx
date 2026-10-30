import React from 'react';
import {
  Cpu,
  Layers,
  Box,
  GitBranch,
  Sliders,
  CheckCircle2,
  Table,
  Sparkles,
  BarChart3,
  Award,
} from 'lucide-react';
import { Badge } from './UI/Badge';
import { VALIDATION_BENCHMARK_RESULTS } from '../constants/models';

export const TechnologySection: React.FC = () => {
  return (
    <section id="technology" className="py-16 sm:py-24 bg-canvas-50 border-t border-charcoal-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <Badge variant="forest" size="md" className="mb-3">
            Deep Learning Architecture & Engineering
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
            Technology & Experimental Methodology.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-charcoal-600 leading-relaxed">
            A comprehensive overview of our image preprocessing pipeline, convolutional neural networks, transfer learning strategy, and the empirical validation benchmark.
          </p>
        </div>

        {/* 1. Preprocessing & Data Augmentation Pipeline */}
        <div className="rounded-2xl bg-white border border-charcoal-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-charcoal-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Sliders className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 block">
                Standardized Pipeline
              </span>
              <h3 className="text-xl font-bold text-charcoal-900">
                Image Preprocessing & Data Augmentation
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-canvas-50 border border-charcoal-100 space-y-2">
              <h4 className="font-bold text-charcoal-900 text-sm">1. Orientation & Native Sizing</h4>
              <p>
                To avoid orientation distortion from mobile and camera EXIF metadata, all uploads pass through <code className="font-mono bg-canvas-200 px-1 py-0.5 rounded text-[11px]">ImageOps.exif_transpose</code>. Images are then scaled to the native input resolution expected by each backbone: <strong>224 × 224</strong> for ResNet-50 / DenseNet-121, and <strong>299 × 299</strong> for Inception-V3 using high-fidelity bilinear resampling.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-canvas-50 border border-charcoal-100 space-y-2">
              <h4 className="font-bold text-charcoal-900 text-sm">2. Stratified Lesion-Level Splits</h4>
              <p>
                A common methodological pitfall in dermoscopy research is patient/lesion leakage across train and test sets when multiple photographs exist for the same lesion. SKINDERMO groups images strictly by <code className="font-mono bg-canvas-200 px-1 py-0.5 rounded text-[11px]">lesion_id</code> before executing a 70/15/15 stratified train/validation/test split.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-canvas-50 border border-charcoal-100 space-y-2">
              <h4 className="font-bold text-charcoal-900 text-sm">3. Invariance Augmentation</h4>
              <p>
                During model training, stochastic spatial augmentations—random horizontal/vertical flips, affine rotations up to 25°, random zooms (±15%), and brightness adjustments—are applied solely to training batches to enforce rotation-invariance against arbitrary dermatoscope positioning.
              </p>
            </div>
          </div>
        </div>

        {/* 2. The Three CNN Architectures */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 block mb-1">
              Evaluated Paradigms
            </span>
            <h3 className="text-2xl font-bold text-charcoal-900">
              Comparative CNN Architectures
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ResNet-50 */}
            <div className="rounded-2xl bg-white border border-charcoal-200 p-6 shadow-card flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    50 Layers • 25.6M Params
                  </span>
                  <Box className="w-5 h-5 text-charcoal-700" />
                </div>
                <h4 className="text-lg font-bold text-charcoal-900">ResNet-50</h4>
                <p className="text-xs text-charcoal-500 font-mono mt-0.5">Deep Residual Learning (He et al.)</p>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mt-3">
                  Employs identity shortcut connections bypassing convolutional blocks (<span className="font-mono">F(x) + x</span>). This mathematical formulation directly solves the vanishing gradient problem, allowing deep layers to capture subtle pigment reticula and borders without representational degradation.
                </p>
              </div>

              <div className="pt-3 border-t border-charcoal-100 text-xs font-mono space-y-1">
                <div className="flex justify-between text-charcoal-600">
                  <span>Input Tensor:</span>
                  <span className="font-bold text-charcoal-900">224 × 224 × 3</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Val Accuracy:</span>
                  <span className="font-bold text-teal-800">67.58% (Rank #1)</span>
                </div>
              </div>
            </div>

            {/* DenseNet-121 */}
            <div className="rounded-2xl bg-white border border-charcoal-200 p-6 shadow-card flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-canvas-100 text-charcoal-800 border border-charcoal-200">
                    121 Layers • 8.1M Params
                  </span>
                  <GitBranch className="w-5 h-5 text-charcoal-700" />
                </div>
                <h4 className="text-lg font-bold text-charcoal-900">DenseNet-121</h4>
                <p className="text-xs text-charcoal-500 font-mono mt-0.5">Densely Connected Networks (Huang et al.)</p>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mt-3">
                  Connects each layer to all subsequent layers in a feed-forward manner via concatenation. Maximizes feature reuse throughout the network, achieving competitive accuracy with 68% fewer parameters than ResNet-50 and yielding the highest macro-F1 score across minority classes.
                </p>
              </div>

              <div className="pt-3 border-t border-charcoal-100 text-xs font-mono space-y-1">
                <div className="flex justify-between text-charcoal-600">
                  <span>Input Tensor:</span>
                  <span className="font-bold text-charcoal-900">224 × 224 × 3</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Val Accuracy:</span>
                  <span className="font-bold text-charcoal-900">67.06% (Rank #2)</span>
                </div>
              </div>
            </div>

            {/* Inception-V3 */}
            <div className="rounded-2xl bg-white border border-charcoal-200 p-6 shadow-card flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-canvas-100 text-charcoal-800 border border-charcoal-200">
                    48 Layers • 23.8M Params
                  </span>
                  <Layers className="w-5 h-5 text-charcoal-700" />
                </div>
                <h4 className="text-lg font-bold text-charcoal-900">Inception-V3</h4>
                <p className="text-xs text-charcoal-500 font-mono mt-0.5">Multi-Scale Factorized Networks (Szegedy et al.)</p>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mt-3">
                  Factorizes standard convolutions into asymmetric 1×7 and 7×1 convolutions with parallel multi-scale receptive fields. Ingests higher spatial resolution (299×299), extracting microscopic textural details alongside global lesion contours simultaneously.
                </p>
              </div>

              <div className="pt-3 border-t border-charcoal-100 text-xs font-mono space-y-1">
                <div className="flex justify-between text-charcoal-600">
                  <span>Input Tensor:</span>
                  <span className="font-bold text-charcoal-900">299 × 299 × 3</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Val Accuracy:</span>
                  <span className="font-bold text-charcoal-900">64.96% (Rank #3)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Actual Empirical Validation Results Table (model_comparison.csv) */}
        <div className="rounded-2xl bg-white border border-charcoal-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-100">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 block mb-1">
                Empirical Research Results
              </span>
              <h3 className="text-2xl font-bold text-charcoal-900">
                Model Evaluation & Comparative Benchmark
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                Exact held-out test evaluation results recorded in <code className="font-mono bg-canvas-100 px-1 py-0.5 rounded text-[11px]">model_comparison.csv</code> on 1,503 test lesions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 font-mono text-xs font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-teal-600" />
                <span>Top Model: ResNet-50</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-charcoal-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm font-mono">
              <thead className="bg-canvas-100 text-charcoal-700 border-b border-charcoal-200">
                <tr>
                  <th className="p-3.5 font-semibold">Rank & Architecture</th>
                  <th className="p-3.5 font-semibold">Test Accuracy</th>
                  <th className="p-3.5 font-semibold">Weighted F1</th>
                  <th className="p-3.5 font-semibold">Macro Precision</th>
                  <th className="p-3.5 font-semibold">Macro Recall</th>
                  <th className="p-3.5 font-semibold">Macro F1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {VALIDATION_BENCHMARK_RESULTS.map((row) => (
                  <tr
                    key={row.modelId}
                    className={row.rank === 1 ? 'bg-teal-50/40 font-semibold' : 'hover:bg-canvas-50'}
                  >
                    <td className="p-3.5 flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        row.rank === 1 ? 'bg-teal-600 text-white' : 'bg-charcoal-200 text-charcoal-700'
                      }`}>
                        {row.rank}
                      </span>
                      <span className="text-charcoal-900 font-bold">{row.name}</span>
                      {row.rank === 1 && (
                        <span className="text-[10px] font-sans font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full border border-teal-200">
                          Best-Performing
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-charcoal-900 font-bold">{(row.accuracy * 100).toFixed(2)}%</td>
                    <td className="p-3.5 text-charcoal-800">{(row.weightedF1 * 100).toFixed(2)}%</td>
                    <td className="p-3.5 text-charcoal-700">{(row.macroPrecision * 100).toFixed(2)}%</td>
                    <td className="p-3.5 text-charcoal-700">{(row.macroRecall * 100).toFixed(2)}%</td>
                    <td className="p-3.5 text-charcoal-700">{(row.macroF1 * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-charcoal-600">
            <div className="p-3 rounded-lg bg-canvas-50 border border-charcoal-200 space-y-1">
              <span className="font-bold text-charcoal-900 block">ResNet-50 (Rank #1):</span>
              <p className="text-[11px] leading-relaxed text-charcoal-600">
                Highest top-1 accuracy (67.58%) and weighted F1-score (58.98%). Optimal feature gradient stability during fine-tuning.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-canvas-50 border border-charcoal-200 space-y-1">
              <span className="font-bold text-charcoal-900 block">DenseNet-121 (Rank #2):</span>
              <p className="text-[11px] leading-relaxed text-charcoal-600">
                Competitive 67.06% accuracy with top macro-F1 (17.97%) and lowest parameter footprint (8.1M params).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-canvas-50 border border-charcoal-200 space-y-1">
              <span className="font-bold text-charcoal-900 block">Inception-V3 (Rank #3):</span>
              <p className="text-[11px] leading-relaxed text-charcoal-600">
                64.96% accuracy on 299×299 native inputs with multi-scale parallel factorized convolution operations.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
