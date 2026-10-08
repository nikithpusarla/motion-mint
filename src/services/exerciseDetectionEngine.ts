import { soundService } from './audioService';
import {
  ActivityResult,
  ExerciseFrameResult,
  ExerciseType,
  MLModelEngineType,
  YogaAsanaPose,
} from '../types';
import { gymComputerVisionEngine } from './gymComputerVisionEngine';
import { yogaAsanasEngine } from './yogaAsanasEngine';
import { realTimeVisionEngine } from './realTimeVisionEngine';

export interface IExerciseModelAdapter {
  name: string;
  version: string;
  supportedExercises: ExerciseType[];
  processFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<ExerciseFrameResult>;
  reset(): void;
}

export type ExerciseStateCallback = (frameResult: ExerciseFrameResult) => void;

/**
 * Exercise Detection Engine
 * Integrates open-source model architectures:
 * 1. tubakhxn/gym-computer-vision-2 (Rep-based gym exercises & angle kinematics)
 * 2. Vasundhara-Boomi/OpenCV_Yoga-Asanas (Asana pose classification & hold alignment)
 * 3. Real-Time In-Browser Optical Flow & Landmark Kinematics
 */
export class ExerciseDetectionEngine {
  private activeExercise: ExerciseType | null = null;
  private targetGoal: number = 0;
  private currentReps: number = 0;
  private currentHoldSeconds: number = 0;
  private currentPhase: 'UP' | 'DOWN' | 'HOLD' | 'PREPARING' = 'PREPARING';
  private repLogs: { repNumber: number; timestamp: number; formScore: number }[] = [];
  private lastRepTimestamp: number = 0;
  private startTime: number = 0;
  private isRunning: boolean = false;
  private listeners: Set<ExerciseStateCallback> = new Set();
  private customAdapter: IExerciseModelAdapter | null = null;
  private holdTimerInterval: number | null = null;

  // Active ML Model Engine
  private activeEngineMode: MLModelEngineType = 'gym_cv2';
  private activeYogaAsana: YogaAsanaPose = 'warrior_2';

  constructor() {
    this.resetEngines();
  }

  public setEngineMode(mode: MLModelEngineType) {
    this.activeEngineMode = mode;
  }

  public getEngineMode(): MLModelEngineType {
    return this.activeEngineMode;
  }

  public setYogaAsana(asana: YogaAsanaPose) {
    this.activeYogaAsana = asana;
    yogaAsanasEngine.setAsana(asana);
    realTimeVisionEngine.setAsana(asana);
  }

  public getActiveYogaAsana(): YogaAsanaPose {
    return this.activeYogaAsana;
  }

  public registerExternalMLModel(adapter: IExerciseModelAdapter) {
    this.customAdapter = adapter;
  }

  public getActiveAdapterName(): string {
    if (this.customAdapter) return this.customAdapter.name;
    if (this.activeEngineMode === 'gym_cv2') {
      return gymComputerVisionEngine.name;
    }
    if (this.activeEngineMode === 'opencv_yoga') {
      return yogaAsanasEngine.name;
    }
    if (this.activeExercise === 'yoga_asanas' || this.activeExercise === 'yoga') {
      return yogaAsanasEngine.name;
    }
    return gymComputerVisionEngine.name;
  }

  public startSession(exerciseType: ExerciseType, target: number) {
    this.activeExercise = exerciseType;
    this.targetGoal = target;
    this.currentReps = 0;
    this.currentHoldSeconds = 0;
    this.currentPhase = 'PREPARING';
    this.repLogs = [];
    this.lastRepTimestamp = 0;
    this.startTime = Date.now();
    this.isRunning = true;

    this.resetEngines();
    realTimeVisionEngine.setExercise(exerciseType);
    if (this.activeYogaAsana) {
      realTimeVisionEngine.setAsana(this.activeYogaAsana);
    }

    if (this.customAdapter) {
      this.customAdapter.reset();
    }
  }

  private resetEngines() {
    gymComputerVisionEngine.reset();
    yogaAsanasEngine.reset();
    realTimeVisionEngine.reset();
  }

  public stopSession(): ActivityResult {
    this.isRunning = false;
    if (this.holdTimerInterval) {
      clearInterval(this.holdTimerInterval);
      this.holdTimerInterval = null;
    }

    const durationSec = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));
    const isYoga = this.activeExercise === 'yoga_asanas' || this.activeExercise === 'yoga';
    const measuredVal =
      this.activeExercise === 'plank' || isYoga ? this.currentHoldSeconds : this.currentReps;
    const completed = measuredVal >= this.targetGoal;

    const avgFormScore =
      this.repLogs.length > 0
        ? this.repLogs.reduce((a, b) => a + b.formScore, 0) / this.repLogs.length
        : 92;

    const result: ActivityResult = {
      activityId: this.activeExercise || 'pushups',
      activityType: this.activeExercise || 'pushups',
      target: this.targetGoal,
      measuredValue: measuredVal,
      confidence: Math.min(0.98, 0.88 + avgFormScore / 500),
      completed,
      verificationMethod: 'ml_camera',
      durationSeconds: durationSec,
      repLogs: [...this.repLogs],
      timestamp: Date.now(),
    };

    if (completed) {
      soundService.playSuccessChime();
    }

    return result;
  }

  public subscribe(callback: ExerciseStateCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(frameResult: ExerciseFrameResult) {
    this.listeners.forEach((l) => l(frameResult));
  }

  /**
   * Manual rep addition (fallback or keyboard shortcut)
   */
  public incrementManualRep(formScore: number = 94) {
    if (!this.isRunning || !this.activeExercise) return;
    const now = Date.now();
    if (now - this.lastRepTimestamp < 500) return;

    this.lastRepTimestamp = now;
    this.currentReps += 1;
    this.repLogs.push({ repNumber: this.currentReps, timestamp: now, formScore });
    soundService.playRepBeep(this.currentReps);

    const frameResult: ExerciseFrameResult = {
      exerciseType: this.activeExercise,
      repCount: this.currentReps,
      currentPhase: 'UP',
      formScore,
      confidence: 0.95,
      sourceEngine: this.getActiveAdapterName(),
      feedbackMessage: `Rep ${this.currentReps}/${this.targetGoal} verified!`,
      angles: { primaryAngle: 170 },
    };

    this.notifyListeners(frameResult);
  }

  /**
   * Processes live camera frames using real-time Computer Vision pipelines
   */
  public async processVideoFrame(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ): Promise<ExerciseFrameResult | null> {
    if (!this.isRunning || !this.activeExercise) return null;

    if (this.customAdapter) {
      const result = await this.customAdapter.processFrame(video, canvas);
      this.handleAdapterResult(result);
      return result;
    }

    // Run Real-Time Computer Vision Frame Analyzer on live webcam
    const frameResult = realTimeVisionEngine.processVideoFrame(
      video,
      canvas,
      this.targetGoal
    );

    const isYoga = this.activeExercise === 'yoga_asanas' || this.activeExercise === 'yoga';
    const isPlank = this.activeExercise === 'plank';

    if (isYoga || isPlank) {
      if (frameResult.repCount > this.currentHoldSeconds) {
        this.currentHoldSeconds = frameResult.repCount;
        soundService.playRepBeep(this.currentHoldSeconds);
      }
    } else {
      // Synchronize rep count and logs when user completes a repetition in front of camera
      if (frameResult.repCount > this.currentReps) {
        this.currentReps = frameResult.repCount;
        this.lastRepTimestamp = Date.now();
        this.repLogs.push({
          repNumber: this.currentReps,
          timestamp: Date.now(),
          formScore: frameResult.formScore,
        });
        soundService.playRepBeep(this.currentReps);
      }
    }

    this.currentPhase = frameResult.currentPhase;
    this.notifyListeners(frameResult);
    return frameResult;
  }

  private handleAdapterResult(result: ExerciseFrameResult) {
    if (result.repCount > this.currentReps) {
      this.currentReps = result.repCount;
      this.lastRepTimestamp = Date.now();
      this.repLogs.push({
        repNumber: this.currentReps,
        timestamp: Date.now(),
        formScore: result.formScore,
      });
      soundService.playRepBeep(this.currentReps);
    }
    this.notifyListeners(result);
  }
}

export const exerciseDetectionEngine = new ExerciseDetectionEngine();
