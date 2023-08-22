import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<{ message: string }[]>([]);
  public notifications$: Observable<{ message: string }[]> =
    this.notificationsSubject.asObservable();

  constructor() {}

  addNotification(message: string): void {
    const newNotification = { message };
    this.notificationsSubject.next([
      ...this.notificationsSubject.value,
      newNotification,
    ]);

    timer(2000)
      .pipe(take(1))
      .subscribe(() => {
        this.removeNotification(newNotification);
      });
  }

  removeNotification(notification: { message: string }): void {
    const updatedNotifications = this.notificationsSubject.value.filter(
      (n) => n !== notification
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  private audio: HTMLAudioElement = new Audio();
  playNotificationSound(): void {
    //NOTIFICATION SOUND 
    // this.audio.src = 'assets/notification_sound.wav';
    // this.audio.load();
    // this.audio.play();
  }
}
