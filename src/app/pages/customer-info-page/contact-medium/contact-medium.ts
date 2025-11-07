import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ContactMediumResponse } from '../../../models/response/contact-medium-response';
import { ContactMediumService } from '../../../services/contact-medium-service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-medium',
  imports: [CommonModule],
  templateUrl: './contact-medium.html',
  styleUrl: './contact-medium.scss',
})
export class ContactMedium implements OnInit{
  contacts = signal<ContactMediumResponse[] | undefined>(undefined);
 
  // 2. Servisleri inject et
  private contactService = inject(ContactMediumService);
  private route = inject(ActivatedRoute);
 
  // --- Computed Sinyaller (Tasarım için) ---
  // Tasarım statik olduğu için (@for yok), listeyi parçalara ayıran computed sinyaller kullanıyoruz.
  email = computed(() => 
    this.contacts()?.find(c => c.type === 'EMAIL')
  );
  mobilePhone = computed(() => 
    // Backend'den 'PHONE' veya 'MOBILE_PHONE' gelebilir
    this.contacts()?.find(c => c.type === 'PHONE' || c.type === 'MOBILE_PHONE') 
  );
 
  homePhone = computed(() => 
    this.contacts()?.find(c => c.type === 'HOME_PHONE' || c.type === 'HOMEPHONE')
  );
 
  fax = computed(() => 
    this.contacts()?.find(c => c.type === 'FAX')
  );
 
 
  ngOnInit() {
    // 3. Parent route'tan ID'yi çek
    const customerId = this.route.parent?.snapshot.paramMap.get('customerId');
 
    if (customerId) {
      // 4. Yeni servisi çağır
      this.contactService.getContactMediumsByCustomerId(customerId).subscribe({
        next: (data) => {
          this.contacts.set(data || []);
          console.log('Contact Mediums loaded:', data);
        },
        error: (err) => {
          console.error('Failed to load contact mediums:', err);
          this.contacts.set(undefined);
        }
      });
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }
  }
 
  onEdit() {
    console.log('Editing contacts...');
    // TODO: Düzenleme formu açan logic
  }
}
