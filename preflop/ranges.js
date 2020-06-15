RANGES = [
    {
        "type": "RFI",
        "name": "LJ RFI",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AK,AQ,AJ,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQ,KJs,KTs,K9s,QJs,QTs,JTs,T9s,98s,87s,76s,65s,54s",
    },
    {
        "type": "RFI",
        "name": "HJ RFI",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AK,AQ,AJ,AT,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQ,KJ,KTs,K9s,K8s,QJ,QTs,Q9s,JTs,J9s,T9s,98s,87s,76s,65s,54s",
    },
    {
        "type": "RFI",
        "name": "CO RFI",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AK,AQ,AJ,AT,A9,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQ,KJ,KT,K9s,K8s,K7s,K6s,K5s,QJ,QT,Q9s,Q8s,Q7s,JT,J9s,J8s,J7s,T9s,T8s,98s,97s,87s,86s,76s,65s,54s",
    },
    {
        "type": "RFI",
        "name": "BTN RFI",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AK,AQ,AJ,AT,A9,A8,A7,A6,A5,A4,A3,A2s,KQ,KJ,KT,K9,K8,K7s,K6s,K5s,K4s,K3s,K2s,QJ,QT,Q9,Q8s,Q7s,Q6s,Q5s,Q4s,Q3s,JT,J9,J8s,J8o:0.5,J7s,J6s,J5s,T9,T8s,T8o:0.5,T7s,T6s,98s,98o:0.5,97s,96s,87s,86s,76s,75s,65s,64s,54s",
    },
    {
        "type": "RFI",
        "name": "SB RFI",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AK,AQ,AJ,AT,A9,A8,A7,A6,A5,A4,A3s,A2s,KQ,KJ,KT,K9,K8,K7s,K6s,K5s,K4s,K3s,K2s,QJ,QT,Q9,Q8s,Q7s,Q6s,Q5s,Q4s,Q3s,Q2s,JT,J9,J8,J7s,J6s,J5s,J4s,T9,T8,T7s,T6s,98,97s,96s,87s,86s,85s,76s,75s,74s,65s,64s,54s,53s",
    },
    {
        "type": "3bet",
        "name": "HJ vs LJ",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,AK,AQ,AJs,ATs,A5s,KQs,KJs,QJs,JTs,T9s,98s",
    },   
    {
        "type": "3bet",
        "name": "CO vs LJ",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,AK,AQ,AJs,ATs,A5s,KQs,KJs,QJs,JTs,T9s,98s",
    },  
    {
        "type": "3bet",
        "name": "CO vs HJ",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,77,AK,AQ,AJs,AJo:0.75,ATs,A5s,A4s,KQ,KJ,QJs,JTs,T9s,98s,87s,76s,65s",
    },    
    {
        "type": "btn 3bet",
        "name": "BTN vs LJ",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,AK,AQ,AJ,ATs,A5s,A4s,KQ,KJs,QJs,JTs,T9s,98s,87s,76s",
    },    
    {
        "type": "btn 3bet",
        "name": "BTN vs HJ",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,77,AK,AQ,AJ,ATs,A9s,A5s,A4s,KQ,KJs,KTs,K9s,QJs,QTs,JTs,T9s,98s,87s,76s",
    },    
    {
        "type": "btn 3bet",
        "name": "BTN vs CO",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,77,66,AK,AQ,AJ,AT,A9s,A8s,A7s,A5s,A4s,A3s,KQ,KJ,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,98s,97s,87s,76s,65s,54s",
    },  
    {
        "type": "sb 3bet",
        "name": "SB vs LJ/HJ",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,AK,AQ,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,76s",
    },    
    {
        "type": "sb 3bet",
        "name": "SB vs CO",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,77,AK,AQ,AJ,ATs,A5s,A4s,KQ,KJs,KTs,QJs,QTs,JTs,J9s,T9s,98s,87s,76s,65s",
    },    
    {
        "type": "sb 3bet",
        "name": "SB vs BTN",
        "in": "Raise",
        "out": "Fold",
        "hands": "AA,KK,QQ,JJ,TT,99,88,77,66,55,AK,AQ,AJ,AT,A9s,A8s,A7s,A5s,A4s,A3s,KQ,KJ,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,87s,76s,65s,54s",
    },         
]
