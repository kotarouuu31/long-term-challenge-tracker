import { MoodCheck, IfThenPlan, MiniTask, MoodType } from '../types/motivation';
import {
  saveMoodCheck,
  createMoodCheck,
  getIfThenPlansForMood,
  saveMiniTask,
  createMiniTask,
  updateMoodCheckCompletion,
  updateMiniTaskCompletion
} from './motivationUtils';

/**
 * MotivationManager handles the flow of the motivation enhancement features
 */
export class MotivationManager {
  private sessionId: string;
  private challengeName: string;
  private currentMoodCheck: MoodCheck | null = null;
  private selectedPlan: IfThenPlan | null = null;
  private miniTasks: MiniTask[] = [];
  private encouragementIndex: number = 0;

  constructor(sessionId: string, challengeName: string) {
    this.sessionId = sessionId;
    this.challengeName = challengeName;
  }

  /**
   * Records the user's mood and returns plans suitable for that mood
   */
  async recordMood(mood: MoodType): Promise<IfThenPlan[]> {
    const plans = getIfThenPlansForMood(mood);
    return plans;
  }

  /**
   * Selects and saves a specific plan for the current session
   */
  async selectPlan(plan: IfThenPlan): Promise<void> {
    this.selectedPlan = plan;
    
    // Create and save the mood check with the selected plan
    if (!this.currentMoodCheck) {
      this.currentMoodCheck = createMoodCheck(
        this.sessionId,
        // Default to 'good' if no mood was recorded
        'good',
        plan.condition
      );
      await saveMoodCheck(this.currentMoodCheck);
    } else {
      // Update the existing mood check with the selected plan
      this.currentMoodCheck.selectedPlan = plan.condition;
      await updateMoodCheckCompletion(this.currentMoodCheck.id, this.currentMoodCheck.completed);
    }
  }

  /**
   * Creates a mini task for the current session
   */
  async createMiniTask(taskDuration: number): Promise<MiniTask> {
    const miniTask = createMiniTask(this.sessionId, taskDuration);
    await saveMiniTask(miniTask);
    this.miniTasks.push(miniTask);
    return miniTask;
  }

  /**
   * Completes a mini task and returns the next encouragement message
   */
  async completeMiniTask(miniTaskId: string): Promise<string | null> {
    await updateMiniTaskCompletion(miniTaskId, true);
    
    // Find and update the mini task in our local array
    const taskIndex = this.miniTasks.findIndex(task => task.id === miniTaskId);
    if (taskIndex !== -1) {
      this.miniTasks[taskIndex].completed = true;
    }
    
    // Get the next encouragement message if we have a selected plan
    if (this.selectedPlan && this.selectedPlan.encouragement.length > 0) {
      const message = this.selectedPlan.encouragement[this.encouragementIndex % this.selectedPlan.encouragement.length];
      this.encouragementIndex++;
      return message;
    }
    
    return null;
  }

  /**
   * Completes the current mood check
   */
  async completeMoodCheck(): Promise<void> {
    if (this.currentMoodCheck) {
      this.currentMoodCheck.completed = true;
      await updateMoodCheckCompletion(this.currentMoodCheck.id, true);
    }
  }

  /**
   * Gets the challenge name
   */
  getChallengeName(): string {
    return this.challengeName;
  }

  /**
   * Gets the current selected plan
   */
  getSelectedPlan(): IfThenPlan | null {
    return this.selectedPlan;
  }

  /**
   * Gets the current encouragement index
   */
  getEncouragementIndex(): number {
    return this.encouragementIndex;
  }
}
