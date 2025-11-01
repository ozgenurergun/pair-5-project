import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup',
  imports: [],
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class Popup {
  // --- Girdiler (Inputs) ---
  // Dışarıdan bu değerleri ayarlayabilirsin
  @Input() title: string = ''; // Opsiyonel başlık
  @Input() message: string = 'Are you sure?'; // Gösterilecek ana mesaj
  @Input() confirmText: string = 'Yes'; // Onay butonu yazısı
  // İptal butonunu opsiyonel yapalım. Eğer bu boş gelirse, buton hiç görünmez.
  // Bu sayede "Hata" popup'ları için tek buton ('OK') kullanabilirsin.
  @Input() cancelText: string = ''; // İptal butonu yazısı
 
  // --- Çıktılar (Outputs) ---
  // Kullanıcı butonlara bastığında parent component'i bilgilendirir
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
 
  /** Onay butonuna tıklandığında */
  confirm() {
    this.onConfirm.emit();
  }
 
  /** İptal butonuna tıklandığında */
  cancel() {
    this.onCancel.emit();
  }
}

