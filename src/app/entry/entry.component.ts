import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InventoryService } from '../inventory.service';
import { InventoryBase } from '../models/InventoryBase';
import { OpenFoodFactProduct } from '../models/OpenFoodFactProduct';
import { ProductService } from '../product.service';
import { SessionService } from '../session.service';
import { SoundService } from '../sound.service';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {

  public lookupForm: FormGroup = null;
  public sessionId: string = null;
  public lastProduct: OpenFoodFactProduct = null;

  constructor(private readonly route: ActivatedRoute
            , private readonly productSrv: ProductService
            , private readonly soundSrv: SoundService
            , private fb: FormBuilder
            , private invSrv: InventoryService) { }

  ngOnInit(): void{
    // get the current 'session'
    const {sessionId} = (this.route.snapshot.data as any);
    this.sessionId = sessionId;

    // build the form...
    this.lookupForm = this.fb.group({
      upc: [''],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.lookupForm.get('upc').value) {
      const product = await this.productSrv.get(this.lookupForm.get('upc').value);
      if (product) {
        this.soundSrv.playSuccess();
        this.lastProduct = product;
        const inv = InventoryService.convertFromOpenFoodFact(product);
        inv.created = new Date().toISOString();
        // inv.expire = new Date().toISOString();
        inv.session_key = this.sessionId;
        this.invSrv.add(inv);
      } else {
        this.soundSrv.playFail();
        this.lastProduct = null;
        const inv = {
          brand_owner: 'unknown'
          , product_name: 'unknown'
          , created: new Date().toISOString()
          , session_key: this.sessionId
          , code: this.lookupForm.get('upc').value
          , pending: true
        } as InventoryBase;
        this.invSrv.add(inv);
      }
    }
    this.lookupForm.reset();
  }

  

  public onDelete(): void {
    
  }
}
