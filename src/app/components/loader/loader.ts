import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {
  constructor(public loaderService:LoaderService){}
}
