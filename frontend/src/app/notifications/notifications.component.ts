import { Component, OnInit } from '@angular/core';
import { NotificationsService } from './notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  notifications: { message: string }[] = [];

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.notificationsService.notifications$.subscribe((notifications) => {
      this.notifications = notifications;
    });

  }

  removeNotification(notification: { message: string }): void {
    this.notificationsService.removeNotification(notification);
  }
}
