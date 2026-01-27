lnode* swapPairs(lnode* head) {
        lnode* temp=head;
        int len=0;
        while(temp){
            len++;
            temp=temp->next;
        }
        temp=head;
        for(int i=0;i<len;i++){
            if(i%2!=0){
                temp=temp->next;
                continue;
            }
            if(temp->next==NULL) break;
            lnode *dataue=new lnode(temp->data);
            temp->data=temp->next->data;
            temp->next->data=dataue->data;
            temp=temp->next;

        }
        return head;
        
    }