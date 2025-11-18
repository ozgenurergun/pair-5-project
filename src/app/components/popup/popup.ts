import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup',
  imports: [],
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class Popup {
  // --- Girdiler (Inputs) ---
  @Input() title: string = '';
  @Input() message: string = ''; 
  @Input() confirmText: string = 'Yes'; 
  @Input() cancelText: string = ''; 
  // YENİ: Açık/Kapalı kontrolü (Varsayılan true olsun ki eski kullanımlar bozulmasın)
  @Input() isOpen: boolean = true;
 
  // --- Çıktılar (Outputs) ---
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>(); // Kapatma için bunu kullanacağız
 
  confirm() {
    this.onConfirm.emit();
  }
 
  cancel() {
    this.onCancel.emit();
  }
}
